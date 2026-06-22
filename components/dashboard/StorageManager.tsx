'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Invitation } from '@/types/invitation'

interface StorageManagerProps {
  userId: string
  invitation: Invitation
  rsvpCount: number
  guestCount: number
  uploadCount: number
}

interface StorageFile {
  name: string
  id: string | null
  created_at: string | null
  metadata: {
    size: number
    mimetype?: string
  }
  isActive: boolean
}

export function StorageManager({
  userId,
  invitation,
  rsvpCount,
  guestCount,
  uploadCount
}: StorageManagerProps) {
  const [files, setFiles] = useState<StorageFile[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  // Filtering & sorting states
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'active' | 'unused'>('all')
  const [sort, setSort] = useState<'date-desc' | 'date-asc' | 'size-desc' | 'size-asc' | 'name-asc'>('date-desc')
  const [selectedFiles, setSelectedFiles] = useState<string[]>([])

  const supabase = createClient()

  // 1. Extract all active image/video/audio URLs from the invitation configuration
  const inUseUrls = useMemo(() => {
    const urls = new Set<string>()
    
    if (invitation.cover_url) urls.add(invitation.cover_url)
    if (invitation.video_url) urls.add(invitation.video_url)
    if (invitation.music_url) urls.add(invitation.music_url)
    if (Array.isArray(invitation.gallery_urls)) {
      invitation.gallery_urls.forEach((url: string) => urls.add(url))
    }
    
    // Recursively extract all strings (URLs) from the JSON builder_config
    if (invitation.builder_config) {
      const traverse = (obj: any) => {
        if (typeof obj === 'string') {
          if (obj.startsWith('http://') || obj.startsWith('https://') || obj.includes('/storage/')) {
            urls.add(obj)
          }
        } else if (Array.isArray(obj)) {
          obj.forEach(traverse)
        } else if (obj !== null && typeof obj === 'object') {
          Object.values(obj).forEach(traverse)
        }
      }
      traverse(invitation.builder_config)
    }
    
    return urls
  }, [invitation])

  // 2. Fetch files from Supabase Storage
  const fetchStorageFiles = async () => {
    setLoading(true)
    setError('')
    try {
      const { data, error: storageError } = await supabase.storage
        .from('wedding-assets')
        .list(userId, {
          limit: 100
        })

      if (storageError) throw storageError

      if (data) {
        // Map files and determine active status
        const mappedFiles = data
          .filter(f => f.name !== '.emptyFolderPlaceholder')
          .map(f => {
            // Check if any URL currently in use includes this filename
            const filename = f.name
            let isActive = false
            
            inUseUrls.forEach(url => {
              // Decode URL to avoid URI encoding mismatches
              try {
                const decodedUrl = decodeURIComponent(url)
                if (decodedUrl.includes(filename)) {
                  isActive = true
                }
              } catch (e) {
                if (url.includes(filename)) {
                  isActive = true
                }
              }
            })

            return {
              name: f.name,
              id: f.id,
              created_at: f.created_at,
              metadata: {
                size: f.metadata?.size ?? 0,
                mimetype: f.metadata?.mimetype
              },
              isActive
            }
          })
        setFiles(mappedFiles)
      }
    } catch (err: any) {
      console.error('[Fetch Storage Files Error]:', err)
      setError(err?.message || 'Failed to list storage assets.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStorageFiles()
  }, [userId, inUseUrls])

  // 3. Size conversions
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // 4. Calculate Storage Size
  const totalStorageSize = useMemo(() => {
    return files.reduce((sum, f) => sum + f.metadata.size, 0)
  }, [files])

  // Quotas & Estimates
  const storageLimit = 1024 * 1024 * 1024 // 1GB in bytes
  const storageUsagePercentage = Math.min((totalStorageSize / storageLimit) * 100, 100)

  // Database limits: Free tier is 500MB
  // Let's estimate database size based on row counts
  // couples: 1 row (~4kb), guests (~0.5kb each), rsvps (~0.8kb each), uploads (~0.5kb each)
  const estimatedDbBytes = (1 * 4096) + (guestCount * 512) + (rsvpCount * 819) + (uploadCount * 512)
  const dbLimit = 500 * 1024 * 1024 // 500MB
  const dbUsagePercentage = Math.min((estimatedDbBytes / dbLimit) * 100, 100)

  // Vercel estimates: Hobby plan limits
  // 100GB monthly bandwidth. Estimated bandwidth = guest traffic + media loads
  const estimatedVercelBandwidthBytes = (guestCount * 1.5 * 1024 * 1024) + (totalStorageSize * 1.2)
  const vercelBandwidthLimit = 100 * 1024 * 1024 * 1024 // 100GB
  const vercelBandwidthPercentage = Math.min((estimatedVercelBandwidthBytes / vercelBandwidthLimit) * 100, 100)

  // 100 hours serverless execution. Each request is ~150ms.
  const estimatedVercelFunctionsMs = (guestCount * 25 + rsvpCount * 15) * 180
  const vercelFunctionsLimitHrs = 100
  const estimatedVercelFunctionsHrs = estimatedVercelFunctionsMs / 3600000
  const vercelFunctionsPercentage = Math.min((estimatedVercelFunctionsHrs / vercelFunctionsLimitHrs) * 100, 100)

  // Get public asset URL
  const getAssetUrl = (filename: string) => {
    const { data: { publicUrl } } = supabase.storage
      .from('wedding-assets')
      .getPublicUrl(`${userId}/${filename}`)
    return publicUrl
  }

  // 5. Handle Single Deletion
  const handleDeleteSingle = async (filename: string) => {
    if (!confirm(`Are you sure you want to permanently delete "${filename}"? This action cannot be undone.`)) return

    setDeleting(true)
    setError('')
    setSuccess('')
    try {
      const { error: removeError } = await supabase.storage
        .from('wedding-assets')
        .remove([`${userId}/${filename}`])

      if (removeError) throw removeError

      setSuccess(`"${filename}" deleted successfully.`)
      setSelectedFiles(prev => prev.filter(f => f !== filename))
      fetchStorageFiles()
    } catch (err: any) {
      setError(err?.message || 'Failed to delete file.')
    } finally {
      setDeleting(false)
    }
  }

  // 6. Handle Bulk Deletion
  const handleDeleteBulk = async () => {
    if (selectedFiles.length === 0) return
    const message = `Are you sure you want to permanently delete ${selectedFiles.length} selected file(s)? These files will be gone forever.`
    if (!confirm(message)) return

    setDeleting(true)
    setError('')
    setSuccess('')
    try {
      const pathsToDelete = selectedFiles.map(filename => `${userId}/${filename}`)
      
      const { error: removeError } = await supabase.storage
        .from('wedding-assets')
        .remove(pathsToDelete)

      if (removeError) throw removeError

      setSuccess(`Successfully deleted ${selectedFiles.length} file(s).`)
      setSelectedFiles([])
      fetchStorageFiles()
    } catch (err: any) {
      setError(err?.message || 'Failed to bulk delete files.')
    } finally {
      setDeleting(false)
    }
  }

  // 7. Toggle Selection
  const toggleSelectFile = (filename: string) => {
    setSelectedFiles(prev =>
      prev.includes(filename) ? prev.filter(f => f !== filename) : [...prev, filename]
    )
  }

  const toggleSelectAll = (visibleFiles: StorageFile[]) => {
    const visibleNames = visibleFiles.map(f => f.name)
    const allSelected = visibleNames.every(name => selectedFiles.includes(name))
    
    if (allSelected) {
      setSelectedFiles(prev => prev.filter(name => !visibleNames.includes(name)))
    } else {
      setSelectedFiles(prev => {
        const union = new Set([...prev, ...visibleNames])
        return Array.from(union)
      })
    }
  }

  // 8. Filter and Sort files
  const filteredAndSortedFiles = useMemo(() => {
    return files
      .filter(f => {
        // Search query filter
        const matchSearch = f.name.toLowerCase().includes(search.toLowerCase())
        if (!matchSearch) return false

        // Usage filter
        if (filter === 'active') return f.isActive
        if (filter === 'unused') return !f.isActive
        return true
      })
      .sort((a, b) => {
        if (sort === 'date-desc') {
          const tA = a.created_at ? new Date(a.created_at).getTime() : 0
          const tB = b.created_at ? new Date(b.created_at).getTime() : 0
          return tB - tA
        }
        if (sort === 'date-asc') {
          const tA = a.created_at ? new Date(a.created_at).getTime() : 0
          const tB = b.created_at ? new Date(b.created_at).getTime() : 0
          return tA - tB
        }
        if (sort === 'size-desc') return b.metadata.size - a.metadata.size
        if (sort === 'size-asc') return a.metadata.size - b.metadata.size
        if (sort === 'name-asc') return a.name.localeCompare(b.name)
        return 0
      })
  }, [files, search, filter, sort])

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-parchment-500">
            <Link href="/dashboard" className="hover:text-rose-400 transition-colors">📊 Dashboard</Link>
            <span>/</span>
            <span className="text-white">Database & Storage</span>
          </div>
          <h1 className="font-serif text-3xl text-white mt-1">📁 Database & Storage Manager</h1>
          <p className="text-parchment-500 text-sm mt-1">
            Permanently delete orphaned photos and view real-time data quotas.
          </p>
        </div>
        <div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 text-sm text-parchment-300 rounded hover:bg-white/10 hover:text-white transition-all"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="p-4 bg-red-950/20 border border-red-700/30 text-red-300 text-sm rounded">
          ⚠️ {error}
        </div>
      )}
      {success && (
        <div className="p-4 bg-green-950/20 border border-green-700/30 text-green-300 text-sm rounded">
          ✅ {success}
        </div>
      )}

      {/* Usage Quotas Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Storage Stats */}
        <div className="glass-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-parchment-500 uppercase tracking-wider font-medium">Supabase Storage</span>
            <span className="text-xl">🗂️</span>
          </div>
          <div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold text-white">{formatBytes(totalStorageSize)}</span>
              <span className="text-xs text-parchment-500">of 1 GB</span>
            </div>
            <div className="w-full bg-white/5 h-2 rounded overflow-hidden mt-2 border border-white/5">
              <div 
                className="bg-rose-500 h-full rounded transition-all duration-500" 
                style={{ width: `${storageUsagePercentage}%` }}
              />
            </div>
            <p className="text-[11px] text-parchment-600 mt-1.5">
              Used by uploaded media assets.
            </p>
          </div>
        </div>

        {/* Database Stats */}
        <div className="glass-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-parchment-500 uppercase tracking-wider font-medium">Supabase Database</span>
            <span className="text-xl">🛢️</span>
          </div>
          <div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold text-white">{formatBytes(estimatedDbBytes)}</span>
              <span className="text-xs text-parchment-500 font-mono">of 500 MB</span>
            </div>
            <div className="w-full bg-white/5 h-2 rounded overflow-hidden mt-2 border border-white/5">
              <div 
                className="bg-gold-500 h-full rounded transition-all duration-500" 
                style={{ width: `${dbUsagePercentage}%` }}
              />
            </div>
            <p className="text-[11px] text-parchment-600 mt-1.5">
              Estimate based on {guestCount + rsvpCount + uploadCount + 1} db rows.
            </p>
          </div>
        </div>

        {/* Vercel Bandwidth */}
        <div className="glass-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-parchment-500 uppercase tracking-wider font-medium">Vercel Bandwidth</span>
            <span className="text-xl">🌐</span>
          </div>
          <div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold text-white">{(estimatedVercelBandwidthBytes / (1024 * 1024 * 1024)).toFixed(3)} GB</span>
              <span className="text-xs text-parchment-500">of 100 GB</span>
            </div>
            <div className="w-full bg-white/5 h-2 rounded overflow-hidden mt-2 border border-white/5">
              <div 
                className="bg-green-500 h-full rounded transition-all duration-500" 
                style={{ width: `${vercelBandwidthPercentage}%` }}
              />
            </div>
            <p className="text-[11px] text-parchment-600 mt-1.5">
              Estimated traffic transferred.
            </p>
          </div>
        </div>

        {/* Vercel Serverless Functions */}
        <div className="glass-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-parchment-500 uppercase tracking-wider font-medium">Vercel Serverless</span>
            <span className="text-xl">⚡</span>
          </div>
          <div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold text-white">{estimatedVercelFunctionsHrs.toFixed(4)} Hrs</span>
              <span className="text-xs text-parchment-500">of 100 Hrs</span>
            </div>
            <div className="w-full bg-white/5 h-2 rounded overflow-hidden mt-2 border border-white/5">
              <div 
                className="bg-blue-500 h-full rounded transition-all duration-500" 
                style={{ width: `${vercelFunctionsPercentage}%` }}
              />
            </div>
            <p className="text-[11px] text-parchment-600 mt-1.5">
              Estimated compute duration.
            </p>
          </div>
        </div>
      </div>

      {/* Main Files Panel */}
      <div className="glass-card overflow-hidden">
        {/* Controls header */}
        <div className="p-5 border-b border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'all', label: 'All Files' },
              { id: 'active', label: 'Active (In Use)' },
              { id: 'unused', label: 'Unused / Deleted' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id as any)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-sm transition-colors ${
                  filter === tab.id
                    ? 'bg-rose-700 text-white'
                    : 'bg-white/5 text-parchment-400 hover:bg-white/10 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap md:flex-nowrap items-center gap-3">
            {/* Search Input */}
            <div className="relative w-full md:w-60">
              <input
                type="text"
                placeholder="Search files..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-white/5 border border-white/10 text-white px-3 py-1.5 pl-8 text-xs rounded focus:outline-none focus:border-rose-700/50 transition-colors placeholder:text-parchment-600"
              />
              <span className="absolute left-2.5 top-2 text-parchment-500 text-xs">🔍</span>
            </div>

            {/* Sort Select */}
            <select
              value={sort}
              onChange={e => setSort(e.target.value as any)}
              className="bg-white/5 border border-white/10 text-parchment-300 px-3 py-1.5 text-xs rounded focus:outline-none focus:border-rose-700/50 transition-colors"
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="size-desc">Largest First</option>
              <option value="size-asc">Smallest First</option>
              <option value="name-asc">Alphabetical</option>
            </select>

            {/* Refresh Button */}
            <button
              onClick={fetchStorageFiles}
              disabled={loading}
              className="p-1.5 bg-white/5 border border-white/10 text-parchment-400 rounded hover:bg-white/10 hover:text-white disabled:opacity-50 transition-all text-xs"
              title="Refresh Asset List"
            >
              🔄
            </button>
          </div>
        </div>

        {/* Bulk action bar */}
        {selectedFiles.length > 0 && (
          <div className="bg-rose-950/25 border-b border-white/10 px-5 py-3 flex items-center justify-between animate-fade-down">
            <span className="text-xs text-rose-300 font-medium">
              📁 {selectedFiles.length} file(s) selected
            </span>
            <button
              onClick={handleDeleteBulk}
              disabled={deleting}
              className="px-4 py-1.5 bg-rose-700 text-white text-xs font-semibold rounded-sm hover:bg-rose-600 disabled:opacity-50 transition-colors"
            >
              {deleting ? 'Deleting...' : 'Permanently Delete Selected'}
            </button>
          </div>
        )}

        {/* File list table */}
        {loading ? (
          <div className="p-12 text-center text-parchment-500">
            <div className="animate-spin inline-block w-6 h-6 border-2 border-current border-t-transparent text-rose-500 rounded-full mb-3" />
            <p className="text-sm">Fetching files from Supabase Storage...</p>
          </div>
        ) : filteredAndSortedFiles.length === 0 ? (
          <div className="p-16 text-center text-parchment-500">
            <div className="text-4xl mb-4">📂</div>
            <h3 className="text-white text-base font-medium mb-1">No files found</h3>
            <p className="text-xs max-w-xs mx-auto">
              {search 
                ? 'Try adjusting your search query or filters.' 
                : filter === 'unused' 
                  ? 'Great job! You have no unused/deleted files taking up storage space.' 
                  : 'You have not uploaded any media files yet.'
              }
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left text-xs font-medium text-parchment-500 uppercase tracking-wider bg-white/2">
                  <th className="p-4 w-10">
                    <input
                      type="checkbox"
                      checked={filteredAndSortedFiles.every(f => selectedFiles.includes(f.name))}
                      onChange={() => toggleSelectAll(filteredAndSortedFiles)}
                      className="rounded border-white/10 bg-white/5 text-rose-700 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                    />
                  </th>
                  <th className="px-4 py-3">Preview</th>
                  <th className="px-4 py-3">File Name</th>
                  <th className="px-4 py-3">Size</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Uploaded</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredAndSortedFiles.map(file => {
                  const assetUrl = getAssetUrl(file.name)
                  const isImage = file.metadata.mimetype?.startsWith('image/') || 
                    /\.(jpg|jpeg|png|webp|gif|avif)$/i.test(file.name)
                  
                  return (
                    <tr 
                      key={file.name} 
                      className={`hover:bg-white/3 transition-colors ${
                        selectedFiles.includes(file.name) ? 'bg-rose-950/10' : ''
                      }`}
                    >
                      <td className="p-4 text-center">
                        <input
                          type="checkbox"
                          checked={selectedFiles.includes(file.name)}
                          onChange={() => toggleSelectFile(file.name)}
                          className="rounded border-white/10 bg-white/5 text-rose-700 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                        />
                      </td>
                      <td className="px-4 py-3">
                        {isImage ? (
                          <div className="w-12 h-12 rounded border border-white/10 overflow-hidden bg-black/20 flex items-center justify-center">
                            <img 
                              src={assetUrl} 
                              alt="Thumbnail" 
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                // Fallback icon if image fails to render
                                (e.target as HTMLElement).style.display = 'none'
                              }}
                            />
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded border border-white/10 bg-white/5 flex items-center justify-center text-xl">
                            {file.name.endsWith('.mp3') ? '🎵' : file.name.endsWith('.mp4') ? '🎥' : '📄'}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="max-w-xs md:max-w-md truncate">
                          <a 
                            href={assetUrl} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-white hover:text-rose-400 font-mono text-xs hover:underline"
                          >
                            {file.name}
                          </a>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-parchment-400 font-mono">
                        {formatBytes(file.metadata.size)}
                      </td>
                      <td className="px-4 py-3">
                        {file.isActive ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-semibold bg-green-500/10 text-green-400 border border-green-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                            Active (In Use)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20" title="This file was deleted or replaced in your settings and is no longer being used by your invitation page. It is safe to delete.">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                            Unused / Deleted
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-parchment-500">
                        {file.created_at ? new Date(file.created_at).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleDeleteSingle(file.name)}
                          disabled={deleting}
                          className="px-3 py-1.5 bg-red-950/20 border border-red-900/30 text-red-400 text-xs font-medium rounded hover:bg-red-900/30 hover:text-red-300 disabled:opacity-50 transition-colors"
                        >
                          Permanently Delete
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
