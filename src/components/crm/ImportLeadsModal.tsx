import { useState, useRef } from 'react';
import { X, Upload, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { Lead, LeadSource } from '@/types';
import { extractBusinessName } from '@/utils/helpers';

interface ImportLeadsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (leads: Partial<Lead>[]) => Promise<void>;
}

interface ParsedRow {
  raw: string[];
  parsed: Partial<Lead>;
  errors: string[];
  instagramLink?: string;
  websiteLink?: string;
}

export const ImportLeadsModal = ({
  isOpen,
  onClose,
  onImport,
}: ImportLeadsModalProps) => {
  const [pastedData, setPastedData] = useState('');
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [hasHeader, setHasHeader] = useState(true);
  const [columnMapping, setColumnMapping] = useState<Record<number, string>>({});
  const [importResults, setImportResults] = useState<{ success: number; errors: number } | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  if (!isOpen) return null;

  const parseData = (data: string): ParsedRow[] => {
    const lines = data.trim().split('\n').filter(line => line.trim());
    const rows: ParsedRow[] = [];
    
    // Detectar separador (tab, coma, o punto y coma)
    const firstLine = lines[0];
    const hasTabs = firstLine.includes('\t');
    const hasSemicolon = firstLine.includes(';');
    const separator = hasTabs ? '\t' : hasSemicolon ? ';' : ',';

    const dataLines = hasHeader ? lines.slice(1) : lines;

    dataLines.forEach((line, index) => {
      const columns = line.split(separator).map(col => col.trim().replace(/^"|"$/g, ''));
      const errors: string[] = [];
      const parsed: Partial<Lead> = {
        name: '',
        phone: '',
        email: '',
        projectType: '',
        source: 'Directo' as LeadSource,
        location: '',
        context: '',
        contactChannels: [],
        services: [],
        columnId: 'new',
      };
      
      // Variables para almacenar los links detectados
      let instagramLink = '';
      let websiteLink = '';

      // Mapeo automático inteligente
      columns.forEach((col, colIndex) => {
        const colLower = col.toLowerCase();
        
        // Detectar nombre/empresa
        if (!parsed.name && (
          columnMapping[colIndex] === 'name' ||
          colLower.includes('nombre') ||
          colLower.includes('empresa') ||
          colLower.includes('cliente') ||
          colLower.includes('name')
        )) {
          // Si la columna parece ser un email, URL o sitio web, extraer el nombre primero
          if (col.includes('@') || col.includes('http') || col.includes('instagram.com') || col.startsWith('@') || col.includes('www.') || (col.includes('.com') && !col.includes('@'))) {
            const extractedName = extractBusinessName(col);
            parsed.name = extractedName || col;
          } else {
            parsed.name = col || 'Sin nombre';
          }
        }
        
        // Detectar teléfono
        if (!parsed.phone && (
          columnMapping[colIndex] === 'phone' ||
          colLower.includes('tel') ||
          colLower.includes('phone') ||
          colLower.includes('celular') ||
          /^[\d\s\-\+\(\)]+$/.test(col)
        )) {
          parsed.phone = col;
        }
        
        // Detectar email
        if (!parsed.email && (
          columnMapping[colIndex] === 'email' ||
          col.includes('@') ||
          colLower.includes('email') ||
          colLower.includes('correo')
        )) {
          // Si es un email (no Instagram), guardarlo como email
          if (!col.includes('instagram.com') && col.includes('@') && !col.startsWith('@')) {
            parsed.email = col;
          }
        }
        
        // Detectar link de Instagram PRIMERO (antes de sitio web)
        const isInstagram = col.includes('instagram.com') || col.startsWith('@') || colLower.includes('instagram');
        
        if (!instagramLink && isInstagram) {
          instagramLink = col;
          // Si es un usuario de Instagram sin URL completa, construir la URL
          if (col.startsWith('@')) {
            instagramLink = `https://instagram.com/${col.replace('@', '')}`;
          } else if (!col.includes('http') && col.includes('instagram.com')) {
            instagramLink = `https://${col}`;
          }
          // IMPORTANTE: Si es Instagram, NO continuar con la detección de sitio web para esta columna
          // Usar continue para saltar al siguiente elemento del loop
        }
        
        // Detectar sitio web SOLO si NO es Instagram ni otras redes sociales
        // Verificar explícitamente que NO sea Instagram antes de detectar como sitio web
        const isSocialMedia = col.includes('instagram.com') || 
                             col.includes('facebook.com') || 
                             col.includes('linkedin.com') || 
                             col.includes('tiktok.com') ||
                             col.includes('twitter.com') ||
                             col.includes('x.com') ||
                             col.startsWith('@');
        
        // NO detectar como sitio web si es Instagram o si ya se detectó Instagram en esta columna
        if (!websiteLink && !isSocialMedia && !isInstagram) {
          // Detectar si contiene "www." (prioridad alta)
          if (col.includes('www.')) {
            websiteLink = col.trim();
            if (!websiteLink.startsWith('http://') && !websiteLink.startsWith('https://')) {
              websiteLink = `https://${websiteLink}`;
            }
          }
          // Detectar URLs completas
          else if (col.includes('http://') || col.includes('https://')) {
            websiteLink = col;
          }
          // Detectar dominios comunes (.com, .net, .org, .com.ar, etc.)
          else if (
            (col.includes('.com') || col.includes('.net') || col.includes('.org') || col.includes('.ar') || col.includes('.es') || col.includes('.mx')) &&
            !col.includes('@') && // No es un email
            col.trim().length > 4 // Tiene suficiente longitud para ser una URL
          ) {
            websiteLink = col.trim();
            // Si no tiene protocolo, agregarlo
            if (!websiteLink.startsWith('http://') && !websiteLink.startsWith('https://')) {
              websiteLink = `https://${websiteLink}`;
            }
          }
        }
        
        // Detectar ubicación
        if (!parsed.location && (
          columnMapping[colIndex] === 'location' ||
          colLower.includes('ubicación') ||
          colLower.includes('location') ||
          colLower.includes('dirección') ||
          colLower.includes('ciudad')
        )) {
          parsed.location = col;
        }
        
        // Detectar notas/contexto
        if (!parsed.context && (
          columnMapping[colIndex] === 'context' ||
          colLower.includes('nota') ||
          colLower.includes('comentario') ||
          colLower.includes('observación') ||
          col.length > 50
        )) {
          parsed.context = col;
        }
        
        // Detectar fuente
        if (!parsed.source && (
          columnMapping[colIndex] === 'source' ||
          colLower.includes('fuente') ||
          colLower.includes('source') ||
          colLower.includes('origen')
        )) {
          const validSources: LeadSource[] = ['Meta Ads', 'Referido', 'Orgánico', 'Instagram', 'Alianza', 'Directo'];
          if (validSources.some(s => colLower.includes(s.toLowerCase()))) {
            parsed.source = validSources.find(s => colLower.includes(s.toLowerCase())) || 'Directo';
          }
        }
      });

      // Si no se detectó sitio web aún, buscar en todas las columnas después del loop
      // IMPORTANTE: Excluir explícitamente Instagram y otras redes sociales
      // También verificar que NO sea la misma columna que instagramLink
      if (!websiteLink) {
        // Priorizar www. pero excluir redes sociales y la columna de Instagram
        const wwwColumn = columns.find(col => {
          const colTrimmed = col.trim();
          return colTrimmed.includes('www.') &&
                 !colTrimmed.includes('instagram.com') && 
                 !colTrimmed.includes('facebook.com') && 
                 !colTrimmed.includes('linkedin.com') &&
                 !colTrimmed.includes('tiktok.com') &&
                 !colTrimmed.includes('twitter.com') &&
                 !colTrimmed.includes('x.com') &&
                 colTrimmed !== instagramLink; // No es la misma que Instagram
        });
        
        if (wwwColumn) {
          websiteLink = wwwColumn.trim();
          if (!websiteLink.startsWith('http://') && !websiteLink.startsWith('https://')) {
            websiteLink = `https://${websiteLink}`;
          }
        } else {
          // Buscar otras URLs pero excluir redes sociales y la columna de Instagram
          const websiteColumn = columns.find(col => {
            const colTrimmed = col.trim();
            return (colTrimmed.includes('http://') || colTrimmed.includes('https://') || 
                    ((colTrimmed.includes('.com') || colTrimmed.includes('.net') || colTrimmed.includes('.org') || colTrimmed.includes('.ar') || colTrimmed.includes('.es') || colTrimmed.includes('.mx')) &&
                    !colTrimmed.includes('instagram.com') && 
                    !colTrimmed.includes('facebook.com') && 
                    !colTrimmed.includes('linkedin.com') &&
                    !colTrimmed.includes('tiktok.com') &&
                    !colTrimmed.includes('twitter.com') &&
                    !colTrimmed.includes('x.com') &&
                    !colTrimmed.includes('@') && // No es email
                    !colTrimmed.startsWith('@') && // No es usuario de Instagram
                    colTrimmed !== instagramLink)); // No es la misma que Instagram
          });
          
          if (websiteColumn) {
            websiteLink = websiteColumn.trim();
            if (!websiteLink.startsWith('http://') && !websiteLink.startsWith('https://')) {
              websiteLink = `https://${websiteLink}`;
            }
          }
        }
      }
      
      // VALIDACIÓN FINAL CRÍTICA: Si websiteLink contiene instagram.com o es igual a instagramLink, limpiarlo
      if (websiteLink && (websiteLink.includes('instagram.com') || websiteLink === instagramLink || (instagramLink && websiteLink.includes(instagramLink.replace('https://', '').replace('http://', ''))))) {
        websiteLink = '';
      }

      // Si no se detectó nombre, buscar en todas las columnas por email/URL/Instagram/Sitio web
      if (!parsed.name || parsed.name.trim() === '') {
        // Buscar cualquier columna que sea email, URL, Instagram o sitio web (incluyendo @usuario y www.)
        const contactColumn = columns.find(col => {
          const colTrimmed = col.trim();
          return colTrimmed.includes('@') || 
                 colTrimmed.includes('instagram.com') || 
                 colTrimmed.includes('http') ||
                 colTrimmed.startsWith('@') ||
                 colTrimmed.includes('www.') ||
                 colTrimmed.includes('facebook.com') ||
                 colTrimmed.includes('linkedin.com') ||
                 ((colTrimmed.includes('.com') || colTrimmed.includes('.net') || colTrimmed.includes('.org')) && !colTrimmed.includes('@'));
        });
        
        if (contactColumn) {
          const extractedName = extractBusinessName(contactColumn);
          if (extractedName) {
            parsed.name = extractedName;
          }
        }
        
        // Si aún no hay nombre, usar email o teléfono detectados previamente
        if ((!parsed.name || parsed.name.trim() === '') && (parsed.email || parsed.phone)) {
          const extractedName = extractBusinessName(parsed.email || parsed.phone || '');
          if (extractedName) {
            parsed.name = extractedName;
          }
        }
        
        // Si aún no hay nombre, usar la primera columna no vacía (pero verificar si es email/URL)
        if (!parsed.name || parsed.name.trim() === '') {
          const firstCol = columns.find(col => col.trim() !== '');
          if (firstCol) {
            // Si la primera columna es un email/URL, extraer el nombre
            if (firstCol.includes('@') || firstCol.includes('http') || firstCol.includes('instagram.com') || firstCol.startsWith('@')) {
              const extractedName = extractBusinessName(firstCol);
              parsed.name = extractedName || firstCol;
            } else {
              parsed.name = firstCol;
            }
          } else {
            parsed.name = 'Sin nombre';
          }
        }
      }

      // Si el nombre detectado es realmente un email o URL, extraer el nombre real
      if (parsed.name && (parsed.name.includes('@') || parsed.name.includes('http') || parsed.name.includes('instagram.com') || parsed.name.startsWith('@'))) {
        const extractedName = extractBusinessName(parsed.name);
        if (extractedName) {
          parsed.name = extractedName;
        }
      }

      // Validaciones finales - verificar si después de la extracción aún falta nombre
      if (!parsed.name || parsed.name === 'Sin nombre' || parsed.name.trim() === '') {
        errors.push('Falta nombre');
      }

      // Agregar instagram y website al objeto parsed
      // IMPORTANTE: Si es Instagram, NO debe ir a website
      if (instagramLink) {
        parsed.instagram = instagramLink;
        // Si websiteLink es el mismo que instagramLink o contiene instagram.com, limpiarlo
        if (websiteLink && (websiteLink.includes('instagram.com') || websiteLink === instagramLink)) {
          websiteLink = ''; // Limpiar websiteLink si es Instagram
        }
      }
      
      // Solo agregar website si NO es Instagram
      if (websiteLink && !websiteLink.includes('instagram.com')) {
        parsed.website = websiteLink;
      }
      
      // Limpiar websiteLink del objeto row si es Instagram
      const finalWebsiteLink = websiteLink && !websiteLink.includes('instagram.com') ? websiteLink : '';
      
      rows.push({ raw: columns, parsed, errors, instagramLink, websiteLink: finalWebsiteLink });
    });

    return rows;
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    e.preventDefault(); // Prevenir el comportamiento por defecto para evitar duplicación
    e.stopPropagation(); // Detener la propagación del evento
    const text = e.clipboardData.getData('text');
    
    // Establecer el texto directamente en el textarea
    if (textareaRef.current) {
      textareaRef.current.value = text;
    }
    
    setPastedData(text);
    
    // Auto-parsear después de pegar
    setTimeout(() => {
      const parsed = parseData(text);
      setParsedRows(parsed);
    }, 100);
  };

  const handleParse = () => {
    if (!pastedData.trim()) return;
    const parsed = parseData(pastedData);
    setParsedRows(parsed);
  };

  const handleImport = async () => {
    const validLeads = parsedRows
      .filter(row => row.errors.length === 0 && row.parsed.name)
      .map(row => row.parsed);

    if (validLeads.length === 0) {
      alert('No hay leads válidos para importar');
      return;
    }

    try {
      setIsImporting(true);
      await onImport(validLeads);
      setImportResults({
        success: validLeads.length,
        errors: parsedRows.length - validLeads.length,
      });
      
      // Limpiar después de 3 segundos
      setTimeout(() => {
        handleClose();
      }, 3000);
    } catch (err) {
      console.error('Error importing leads:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido al importar leads';
      setImportError(`Error al importar: ${errorMessage}. Verifica la consola para más detalles.`);
    } finally {
      setIsImporting(false);
    }
  };

  const handleClose = () => {
    setPastedData('');
    setParsedRows([]);
    setImportResults(null);
    setImportError(null);
    setColumnMapping({});
    onClose();
  };

  const validLeads = parsedRows.filter(row => row.errors.length === 0 && row.parsed.name);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div
        className="bg-white dark:bg-[#252525] rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-[#3d3d3d] flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Importar Leads desde Excel
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Pega los datos copiados desde Excel (Ctrl+V)
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-[#353535] transition-colors text-slate-500 dark:text-slate-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {importResults ? (
            <div className="text-center py-8">
              <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                Importación completada
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                {importResults.success} leads importados correctamente
                {importResults.errors > 0 && ` • ${importResults.errors} con errores`}
              </p>
            </div>
          ) : (
            <>
              {/* Área de pegado */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Pega los datos aquí (Ctrl+V)
                </label>
                <textarea
                  ref={textareaRef}
                  value={pastedData}
                  onChange={(e) => setPastedData(e.target.value)}
                  onPaste={handlePaste}
                  placeholder="Copia y pega los datos desde Excel aquí..."
                  className="w-full h-32 px-3 py-2 bg-white dark:bg-[#2d2d2d] border border-slate-300 dark:border-[#3d3d3d] rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent font-mono text-sm"
                  disabled={isImporting}
                />
                <div className="flex items-center gap-4 mt-2">
                  <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <input
                      type="checkbox"
                      checked={hasHeader}
                      onChange={(e) => setHasHeader(e.target.checked)}
                      className="rounded"
                    />
                    Primera fila es encabezado
                  </label>
                  <button
                    onClick={handleParse}
                    disabled={!pastedData.trim() || isImporting}
                    className="px-4 py-2 text-sm font-medium text-white bg-primary-500 dark:bg-primary-600 rounded-lg hover:bg-primary-600 dark:hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    Analizar datos
                  </button>
                </div>
              </div>

              {/* Mensaje de error */}
              {importError && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-red-800 dark:text-red-200">{importError}</p>
                  </div>
                  <button
                    onClick={() => setImportError(null)}
                    className="text-red-400 hover:text-red-600 dark:hover:text-red-300"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Vista previa */}
              {parsedRows.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                      Vista previa ({validLeads.length} válidos de {parsedRows.length} total)
                    </h3>
                    <div className="flex items-center gap-2 text-xs">
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-green-500 rounded"></div>
                        <span className="text-slate-600 dark:text-slate-400">Válido</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-red-500 rounded"></div>
                        <span className="text-slate-600 dark:text-slate-400">Error</span>
                      </div>
                    </div>
                  </div>
                  <div className="border border-slate-200 dark:border-[#3d3d3d] rounded-lg overflow-hidden">
                    <div className="max-h-64 overflow-y-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-slate-50 dark:bg-[#2d2d2d] sticky top-0">
                          <tr>
                            <th className="px-3 py-2 text-left text-xs font-medium text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-[#3d3d3d]">
                              Estado
                            </th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-[#3d3d3d]">
                              Nombre
                            </th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-[#3d3d3d]">
                              Teléfono
                            </th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-[#3d3d3d]">
                              Email
                            </th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-[#3d3d3d]">
                              Instagram
                            </th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-[#3d3d3d]">
                              Sitio Web
                            </th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-[#3d3d3d]">
                              Ubicación
                            </th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-[#3d3d3d]">
                              Notas
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-[#3d3d3d]">
                          {parsedRows.slice(0, 20).map((row, idx) => (
                            <tr
                              key={idx}
                              className={row.errors.length > 0 ? 'bg-red-50/50 dark:bg-red-900/10' : ''}
                            >
                              <td className="px-3 py-2">
                                {row.errors.length > 0 ? (
                                  <AlertCircle className="w-4 h-4 text-red-500" />
                                ) : (
                                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                                )}
                              </td>
                              <td className="px-3 py-2 text-slate-900 dark:text-white">
                                {row.parsed.name || '-'}
                              </td>
                              <td className="px-3 py-2 text-slate-600 dark:text-slate-400">
                                {row.parsed.phone || '-'}
                              </td>
                              <td className="px-3 py-2 text-slate-600 dark:text-slate-400">
                                {row.parsed.email || '-'}
                              </td>
                              <td className="px-3 py-2 text-slate-600 dark:text-slate-400">
                                {row.instagramLink ? (
                                  <a
                                    href={row.instagramLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-pink-500 dark:text-pink-400 hover:underline truncate block max-w-[150px]"
                                    title={row.instagramLink}
                                  >
                                    {row.instagramLink.length > 30 
                                      ? `${row.instagramLink.substring(0, 27)}...` 
                                      : row.instagramLink}
                                  </a>
                                ) : (
                                  '-'
                                )}
                              </td>
                              <td className="px-3 py-2 text-slate-600 dark:text-slate-400">
                                {row.websiteLink ? (
                                  <a
                                    href={row.websiteLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-500 dark:text-blue-400 hover:underline truncate block max-w-[150px]"
                                    title={row.websiteLink}
                                  >
                                    {row.websiteLink.length > 30 
                                      ? `${row.websiteLink.substring(0, 27)}...` 
                                      : row.websiteLink}
                                  </a>
                                ) : (
                                  '-'
                                )}
                              </td>
                              <td className="px-3 py-2 text-slate-600 dark:text-slate-400">
                                {row.parsed.location || '-'}
                              </td>
                              <td className="px-3 py-2 text-slate-600 dark:text-slate-400 max-w-xs truncate">
                                {row.parsed.context || '-'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {parsedRows.length > 20 && (
                        <div className="px-3 py-2 text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-[#2d2d2d] text-center border-t border-slate-200 dark:border-[#3d3d3d]">
                          Mostrando 20 de {parsedRows.length} filas
                        </div>
                      )}
                    </div>
                  </div>
                  {parsedRows.some(row => row.errors.length > 0) && (
                    <div className="mt-2 text-xs text-red-600 dark:text-red-400">
                      Algunas filas tienen errores y no se importarán
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {!importResults && (
          <div className="p-6 border-t border-slate-200 dark:border-[#3d3d3d] flex items-center justify-end gap-3 flex-shrink-0">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-[#353535] rounded-lg hover:bg-slate-200 dark:hover:bg-[#404040] transition-colors"
              disabled={isImporting}
            >
              Cancelar
            </button>
            <button
              onClick={handleImport}
              disabled={validLeads.length === 0 || isImporting}
              className="px-4 py-2 text-sm font-medium text-white bg-primary-500 dark:bg-primary-600 rounded-lg hover:bg-primary-600 dark:hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isImporting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Importando...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Importar {validLeads.length} lead{validLeads.length !== 1 ? 's' : ''}
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

