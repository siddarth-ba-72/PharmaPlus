import { useEffect, useMemo, useRef, useState } from 'react'
import { AdminService } from '../../services/AdminService'

type UploadMetadata = {
    uploadId: string
    sheets: string[]
    detectedHeaderRowCandidates: number[]
}

type PreviewStats = {
    jobId: string
    state: string
    stats: {
        totalRows: number
        validRows: number
        warningRows: number
        invalidRows: number
    }
}

type ExecutionStats = {
    pending: number
    processing: number
    success: number
    failedRetryable: number
    failedPermanent: number
}

export const AdminMedicineImportComponent = () => {
    const adminService = useMemo(() => new AdminService(), [])
    const pollingTimerRef = useRef<number | null>(null)

    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [uploadMetadata, setUploadMetadata] = useState<UploadMetadata | null>(null)
    const [selectedSheet, setSelectedSheet] = useState<string>('')
    const [selectedHeaderRowIndex, setSelectedHeaderRowIndex] = useState<number>(1)
    const [previewStats, setPreviewStats] = useState<PreviewStats | null>(null)
    const [executionStats, setExecutionStats] = useState<ExecutionStats | null>(null)
    const [invalidRows, setInvalidRows] = useState<Array<{ rowNumber: number; errors: Array<{ code: string; message: string }> }>>([])
    const [isBusy, setIsBusy] = useState(false)
    const [errorMessage, setErrorMessage] = useState<string>('')
    const [successMessage, setSuccessMessage] = useState<string>('')

    const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0] || null
        setSelectedFile(file)
        setUploadMetadata(null)
        setPreviewStats(null)
        setExecutionStats(null)
        setInvalidRows([])
        setErrorMessage('')
        setSuccessMessage('')

        if (pollingTimerRef.current) {
            window.clearInterval(pollingTimerRef.current)
            pollingTimerRef.current = null
        }
    }

    const uploadFile = async () => {
        if (!selectedFile) {
            setErrorMessage('Please choose an Excel file first.')
            return
        }

        setIsBusy(true)
        setErrorMessage('')
        setSuccessMessage('')

        try {
            const uploadSession = await adminService.createMedicineImportUploadSession(selectedFile)
            const completion = await adminService.completeMedicineImportUpload(uploadSession.uploadId, selectedFile)

            const nextUploadMetadata: UploadMetadata = {
                uploadId: completion.uploadId,
                sheets: completion.sheets,
                detectedHeaderRowCandidates: completion.detectedHeaderRowCandidates,
            }

            setUploadMetadata(nextUploadMetadata)
            setSelectedSheet(completion.sheets[0] || '')
            setSelectedHeaderRowIndex(completion.detectedHeaderRowCandidates[0] || 1)
            setSuccessMessage('Upload completed. You can now generate a preview job.')
        } catch (error: any) {
            setErrorMessage(error?.message || 'Failed to upload file.')
        } finally {
            setIsBusy(false)
        }
    }

    const generatePreview = async () => {
        if (!uploadMetadata) {
            setErrorMessage('Complete upload before creating a preview job.')
            return
        }

        setIsBusy(true)
        setErrorMessage('')
        setSuccessMessage('')

        try {
            const preview = await adminService.createMedicineImportPreviewJob({
                uploadId: uploadMetadata.uploadId,
                sheetName: selectedSheet || undefined,
                headerRowIndex: selectedHeaderRowIndex,
                mode: 'UPSERT',
                dryRun: true,
            })

            setPreviewStats(preview)
            setExecutionStats({
                pending: preview.stats.validRows,
                processing: 0,
                success: 0,
                failedRetryable: 0,
                failedPermanent: 0,
            })

            const invalidPreviewRows = await adminService.getMedicineImportRows(preview.jobId, 'INVALID')
            setInvalidRows(
                invalidPreviewRows.items.map((row) => ({
                    rowNumber: row.rowNumber,
                    errors: row.errors,
                })),
            )

            setSuccessMessage('Preview generated successfully.')
        } catch (error: any) {
            setErrorMessage(error?.message || 'Failed to generate preview job.')
        } finally {
            setIsBusy(false)
        }
    }

    const refreshJobSummary = async (jobId: string) => {
        const summary = await adminService.getMedicineImportJobSummary(jobId)
        setPreviewStats({
            jobId: summary.jobId,
            state: summary.state,
            stats: summary.stats,
        })
        setExecutionStats(summary.execution)

        const terminalStates = new Set(['SUCCEEDED', 'PARTIAL_SUCCESS', 'FAILED', 'CANCELLED'])
        if (terminalStates.has(summary.state) && pollingTimerRef.current) {
            window.clearInterval(pollingTimerRef.current)
            pollingTimerRef.current = null

            if (summary.state === 'SUCCEEDED') {
                setSuccessMessage('Medicine import completed successfully.')
            } else if (summary.state === 'PARTIAL_SUCCESS') {
                setSuccessMessage('Import finished with some failed rows. Use Retry Failed for retryable rows.')
            } else if (summary.state === 'CANCELLED') {
                setSuccessMessage('Import execution was cancelled.')
            }
        }
    }

    const startPollingJobSummary = (jobId: string) => {
        if (pollingTimerRef.current) {
            window.clearInterval(pollingTimerRef.current)
        }

        pollingTimerRef.current = window.setInterval(() => {
            void refreshJobSummary(jobId)
        }, 2000)
    }

    const startImport = async () => {
        if (!previewStats) {
            setErrorMessage('Generate preview before starting import.')
            return
        }

        setIsBusy(true)
        setErrorMessage('')
        setSuccessMessage('')

        try {
            await adminService.approveAndStartMedicineImport(previewStats.jobId)
            setSuccessMessage('Import execution started. Tracking progress...')
            startPollingJobSummary(previewStats.jobId)
            await refreshJobSummary(previewStats.jobId)
        } catch (error: any) {
            setErrorMessage(error?.message || 'Failed to start import execution.')
        } finally {
            setIsBusy(false)
        }
    }

    const cancelImport = async () => {
        if (!previewStats) {
            return
        }

        setIsBusy(true)
        setErrorMessage('')
        setSuccessMessage('')

        try {
            await adminService.cancelMedicineImport(previewStats.jobId)
            setSuccessMessage('Cancel requested. Waiting for execution to stop...')
            await refreshJobSummary(previewStats.jobId)
        } catch (error: any) {
            setErrorMessage(error?.message || 'Failed to cancel import execution.')
        } finally {
            setIsBusy(false)
        }
    }

    const retryFailedRows = async () => {
        if (!previewStats) {
            return
        }

        setIsBusy(true)
        setErrorMessage('')
        setSuccessMessage('')

        try {
            await adminService.retryFailedMedicineImportRows(previewStats.jobId, 'FAILED_RETRYABLE')
            setSuccessMessage('Retry started for retryable failed rows.')
            startPollingJobSummary(previewStats.jobId)
            await refreshJobSummary(previewStats.jobId)
        } catch (error: any) {
            setErrorMessage(error?.message || 'Failed to retry failed rows.')
        } finally {
            setIsBusy(false)
        }
    }

    useEffect(() => {
        return () => {
            if (pollingTimerRef.current) {
                window.clearInterval(pollingTimerRef.current)
                pollingTimerRef.current = null
            }
        }
    }, [])

    return (
        <section className="space-y-4">
            <div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Medicine Import (Phase 1)</h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Upload an Excel file, generate deterministic validation preview, and inspect invalid rows.
                </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white/95 p-5 shadow dark:border-slate-800 dark:bg-slate-900/95">
                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">Select Excel File</label>
                <input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={onFileChange}
                    className="block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
                />

                <div className="mt-4 flex flex-wrap items-center gap-3">
                    <button
                        type="button"
                        onClick={uploadFile}
                        disabled={isBusy || !selectedFile}
                        className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-400"
                    >
                        {isBusy ? 'Working...' : 'Upload and Parse Workbook'}
                    </button>
                </div>
            </div>

            {uploadMetadata && (
                <div className="rounded-2xl border border-slate-200 bg-white/95 p-5 shadow dark:border-slate-800 dark:bg-slate-900/95">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Upload Metadata</h3>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Upload Id: {uploadMetadata.uploadId}</p>

                    <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                        <div>
                            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Sheet</label>
                            <select
                                value={selectedSheet}
                                onChange={(event) => setSelectedSheet(event.target.value)}
                                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
                            >
                                {uploadMetadata.sheets.map((sheet) => (
                                    <option key={sheet} value={sheet}>{sheet}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Header Row</label>
                            <select
                                value={selectedHeaderRowIndex}
                                onChange={(event) => setSelectedHeaderRowIndex(Number(event.target.value))}
                                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
                            >
                                {uploadMetadata.detectedHeaderRowCandidates.map((candidate) => (
                                    <option key={candidate} value={candidate}>{candidate}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={generatePreview}
                        disabled={isBusy}
                        className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-500 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300"
                    >
                        Generate Preview Job
                    </button>
                </div>
            )}

            {previewStats && (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5 dark:border-emerald-900/60 dark:bg-emerald-900/20">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <h3 className="text-lg font-semibold text-emerald-900 dark:text-emerald-200">Preview Summary</h3>
                        <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-bold tracking-wide text-slate-700 dark:bg-slate-900/70 dark:text-slate-200">
                            State: {previewStats.state}
                        </span>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
                        <div className="rounded-lg bg-white/70 p-3 dark:bg-slate-900/40">
                            <p className="text-slate-500">Total</p>
                            <p className="text-xl font-bold text-slate-900 dark:text-slate-100">{previewStats.stats.totalRows}</p>
                        </div>
                        <div className="rounded-lg bg-white/70 p-3 dark:bg-slate-900/40">
                            <p className="text-slate-500">Valid</p>
                            <p className="text-xl font-bold text-emerald-700 dark:text-emerald-300">{previewStats.stats.validRows}</p>
                        </div>
                        <div className="rounded-lg bg-white/70 p-3 dark:bg-slate-900/40">
                            <p className="text-slate-500">Warnings</p>
                            <p className="text-xl font-bold text-amber-700 dark:text-amber-300">{previewStats.stats.warningRows}</p>
                        </div>
                        <div className="rounded-lg bg-white/70 p-3 dark:bg-slate-900/40">
                            <p className="text-slate-500">Invalid</p>
                            <p className="text-xl font-bold text-rose-700 dark:text-rose-300">{previewStats.stats.invalidRows}</p>
                        </div>
                    </div>

                    {executionStats && (
                        <div className="mt-3 grid grid-cols-2 gap-3 text-sm md:grid-cols-5">
                            <div className="rounded-lg bg-white/70 p-3 dark:bg-slate-900/40">
                                <p className="text-slate-500">Pending</p>
                                <p className="text-lg font-bold text-slate-900 dark:text-slate-100">{executionStats.pending}</p>
                            </div>
                            <div className="rounded-lg bg-white/70 p-3 dark:bg-slate-900/40">
                                <p className="text-slate-500">Processing</p>
                                <p className="text-lg font-bold text-sky-700 dark:text-sky-300">{executionStats.processing}</p>
                            </div>
                            <div className="rounded-lg bg-white/70 p-3 dark:bg-slate-900/40">
                                <p className="text-slate-500">Success</p>
                                <p className="text-lg font-bold text-emerald-700 dark:text-emerald-300">{executionStats.success}</p>
                            </div>
                            <div className="rounded-lg bg-white/70 p-3 dark:bg-slate-900/40">
                                <p className="text-slate-500">Retryable Failed</p>
                                <p className="text-lg font-bold text-amber-700 dark:text-amber-300">{executionStats.failedRetryable}</p>
                            </div>
                            <div className="rounded-lg bg-white/70 p-3 dark:bg-slate-900/40">
                                <p className="text-slate-500">Permanent Failed</p>
                                <p className="text-lg font-bold text-rose-700 dark:text-rose-300">{executionStats.failedPermanent}</p>
                            </div>
                        </div>
                    )}

                    <div className="mt-4 flex flex-wrap items-center gap-3">
                        <button
                            type="button"
                            onClick={startImport}
                            disabled={isBusy || !['REVIEW_REQUIRED', 'PARTIAL_SUCCESS'].includes(previewStats.state)}
                            className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-emerald-400"
                        >
                            Start Import
                        </button>

                        <button
                            type="button"
                            onClick={cancelImport}
                            disabled={isBusy || !['QUEUED', 'RUNNING', 'RETRYING'].includes(previewStats.state)}
                            className="rounded-lg bg-rose-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-800 disabled:cursor-not-allowed disabled:bg-rose-400"
                        >
                            Cancel Import
                        </button>

                        <button
                            type="button"
                            onClick={retryFailedRows}
                            disabled={isBusy || !['PARTIAL_SUCCESS', 'FAILED', 'CANCELLED'].includes(previewStats.state)}
                            className="rounded-lg bg-amber-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-800 disabled:cursor-not-allowed disabled:bg-amber-400"
                        >
                            Retry Failed
                        </button>
                    </div>
                </div>
            )}

            {invalidRows.length > 0 && (
                <div className="rounded-2xl border border-rose-200 bg-rose-50/70 p-5 dark:border-rose-900/60 dark:bg-rose-900/20">
                    <h3 className="text-lg font-semibold text-rose-900 dark:text-rose-200">Invalid Rows (first page)</h3>
                    <ul className="mt-3 space-y-2 text-sm text-rose-900 dark:text-rose-200">
                        {invalidRows.map((row) => (
                            <li key={row.rowNumber} className="rounded-lg border border-rose-200 bg-white/70 p-3 dark:border-rose-900/60 dark:bg-slate-900/40">
                                <p className="font-semibold">Row {row.rowNumber}</p>
                                <p>{row.errors.map((error) => `${error.code}: ${error.message}`).join(' | ')}</p>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {errorMessage && (
                <p className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-medium text-rose-700 dark:border-rose-900/70 dark:bg-rose-950/40 dark:text-rose-300">
                    {errorMessage}
                </p>
            )}

            {successMessage && (
                <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 dark:border-emerald-900/70 dark:bg-emerald-950/40 dark:text-emerald-300">
                    {successMessage}
                </p>
            )}
        </section>
    )
}
