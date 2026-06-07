'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'

interface Photo {
  id: string
  url: string
  guest_name: string
  is_moderated: boolean
}

interface PhotoModerationProps {
  initialPhotos: Photo[]
  invitationId: string
}

export function PhotoModeration({ initialPhotos, invitationId }: PhotoModerationProps) {
  const [photos, setPhotos] = useState<Photo[]>(initialPhotos)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const supabase = createClient()

  const handleApprove = async (photoId: string) => {
    setLoadingId(photoId)
    try {
      const { error } = await (supabase.from('guest_uploads') as any)
        .update({ is_moderated: true })
        .eq('id', photoId)

      if (error) throw error

      setPhotos(prev =>
        prev.map(p => (p.id === photoId ? { ...p, is_moderated: true } : p))
      )
    } catch (err) {
      console.error('Failed to approve photo:', err)
      alert('Failed to approve photo')
    } finally {
      setLoadingId(null)
    }
  }

  const handleDelete = async (photoId: string, photoUrl: string) => {
    if (!confirm('Are you sure you want to delete this photo?')) return
    setLoadingId(photoId)
    try {
      // 1. Delete from database
      const { error: dbErr } = await (supabase.from('guest_uploads') as any)
        .delete()
        .eq('id', photoId)

      if (dbErr) throw dbErr

      // 2. Delete from Supabase Storage
      const pathParts = photoUrl.split('/wedding-assets/')
      if (pathParts.length > 1) {
        const storagePath = pathParts[1]
        await supabase.storage.from('wedding-assets').remove([storagePath])
      }

      setPhotos(prev => prev.filter(p => p.id !== photoId))
    } catch (err) {
      console.error('Failed to delete photo:', err)
      alert('Failed to delete photo')
    } finally {
      setLoadingId(null)
    }
  }

  const pendingPhotos = photos.filter(p => !p.is_moderated)
  const approvedPhotos = photos.filter(p => p.is_moderated)

  return (
    <div className="bg-white/5 border border-white/10 rounded-sm overflow-hidden p-6 space-y-6">
      <div>
        <h2 className="text-base font-medium text-white">Guest Photo Moderation Wall</h2>
        <p className="text-xs text-parchment-500 mt-1">Review, approve or remove photos uploaded by your guests.</p>
      </div>

      {/* Pending Approval */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-400">
          ⏳ Pending Review ({pendingPhotos.length})
        </h3>
        
        {pendingPhotos.length === 0 ? (
          <p className="text-xs text-parchment-600 italic py-2 bg-black/10 px-3 rounded-sm border border-white/5">No photos pending review.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {pendingPhotos.map(photo => (
              <div key={photo.id} className="relative aspect-square border border-white/10 bg-black/40 rounded-sm overflow-hidden flex flex-col justify-between group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photo.url} alt="Pending upload" className="absolute inset-0 w-full h-full object-cover" />
                
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2 z-10 space-y-2">
                  <p className="text-[10px] text-white font-medium truncate">By: {photo.guest_name}</p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="primary"
                      className="text-[9px] py-1 bg-green-700 hover:bg-green-600 flex-1"
                      onClick={() => handleApprove(photo.id)}
                      disabled={loadingId === photo.id}
                    >
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="text-[9px] py-1 bg-red-950/60 hover:bg-red-900 border-red-800/40 text-red-300 flex-1"
                      onClick={() => handleDelete(photo.id, photo.url)}
                      disabled={loadingId === photo.id}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Approved Photos */}
      <div className="space-y-3 border-t border-white/5 pt-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-green-400">
          ✓ Approved Photos ({approvedPhotos.length})
        </h3>
        
        {approvedPhotos.length === 0 ? (
          <p className="text-xs text-parchment-600 italic py-2 bg-black/10 px-3 rounded-sm border border-white/5">No approved photos yet.</p>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {approvedPhotos.map(photo => (
              <div key={photo.id} className="relative aspect-square border border-white/5 bg-black/40 rounded-sm overflow-hidden group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photo.url} alt="Approved upload" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-1.5 z-10 space-y-1.5">
                  <p className="text-[9px] text-white truncate">Shared by: {photo.guest_name}</p>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="text-[9px] py-0.5 bg-red-950/80 hover:bg-red-900 text-red-300 w-full"
                    onClick={() => handleDelete(photo.id, photo.url)}
                    disabled={loadingId === photo.id}
                  >
                    Remove Photo
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
