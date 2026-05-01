import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { MapPin, Calendar, CheckCircle, Star, AlertTriangle, MessageCircle, ArrowLeft } from 'lucide-react'
import { fetchTreeById, fetchComments, addComment, toggleFavorite, confirmTree, reportTree } from '../services/api'
import { useAuth } from '../hooks/useAuth'
import { Badge } from '../components/Badge'
import { Modal } from '../components/Modal'
import { formatDate, formatHarvestMonths, buildPhotoUrl } from '../utils/helpers'
import { CONDITION_LABELS, CONDITION_COLORS, ACCESSIBILITY_LABELS } from '../utils/constants'

export function TreeDetail() {
  const { treeId } = useParams<{ treeId: string }>()
  const { isAuthenticated, authenticatedUser } = useAuth()
  const queryClient = useQueryClient()
  const [commentContent, setCommentContent] = useState('')
  const [isReportModalOpen, setIsReportModalOpen] = useState(false)
  const [activePhotoIndex, setActivePhotoIndex] = useState(0)

  const { data: fruitTree, isLoading, error } = useQuery({
    queryKey: ['tree', treeId],
    queryFn: () => fetchTreeById(treeId!),
    enabled: !!treeId,
  })

  const { data: commentsResponse } = useQuery({
    queryKey: ['tree-comments', treeId],
    queryFn: () => fetchComments(treeId!),
    enabled: !!treeId,
  })

  const confirmMutation = useMutation({
    mutationFn: () => confirmTree(treeId!),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tree', treeId] }),
  })

  const reportMutation = useMutation({
    mutationFn: () => reportTree(treeId!),
    onSuccess: () => setIsReportModalOpen(false),
  })

  const favoriteMutation = useMutation({
    mutationFn: () => toggleFavorite(treeId!),
  })

  const addCommentMutation = useMutation({
    mutationFn: () => addComment(treeId!, commentContent),
    onSuccess: () => {
      setCommentContent('')
      queryClient.invalidateQueries({ queryKey: ['tree-comments', treeId] })
    },
  })

  const isFavorited = authenticatedUser?.favorites?.includes(treeId ?? '') ?? false

  if (isLoading) return <div className="text-center py-16 text-gray-400">Chargement…</div>
  if (error || !fruitTree) return (
    <div className="text-center py-16">
      <p className="text-red-500">Arbre introuvable</p>
      <Link to="/" className="mt-4 inline-block text-forest-600 hover:underline">Retour à l'accueil</Link>
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors"
      >
        <ArrowLeft size={16} /> Retour
      </Link>

      {/* Photos */}
      {fruitTree.photos.length > 0 && (
        <div className="rounded-2xl overflow-hidden mb-6 bg-gray-100">
          <img
            src={buildPhotoUrl(fruitTree.photos[activePhotoIndex])}
            alt={`${fruitTree.species} — photo ${activePhotoIndex + 1}`}
            className="w-full h-64 object-cover"
          />
          {fruitTree.photos.length > 1 && (
            <div className="flex gap-2 p-3">
              {fruitTree.photos.map((photoUrl, photoIndex) => (
                <button
                  key={photoUrl}
                  onClick={() => setActivePhotoIndex(photoIndex)}
                  className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                    photoIndex === activePhotoIndex ? 'border-forest-500' : 'border-transparent'
                  }`}
                >
                  <img
                    src={buildPhotoUrl(photoUrl)}
                    alt={`Miniature ${photoIndex + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {fruitTree.photos.length === 0 && (
        <div className="h-40 bg-gray-100 rounded-2xl flex items-center justify-center text-5xl mb-6">🌳</div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{fruitTree.species}</h1>
          <p className="text-forest-600 font-medium">{fruitTree.fruitType}</p>
        </div>
        <div className="flex items-center gap-2">
          {fruitTree.isVerified && (
            <CheckCircle size={22} className="text-forest-500" aria-label="Arbre vérifié" />
          )}
          {isAuthenticated && (
            <button
              onClick={() => favoriteMutation.mutate()}
              className={`p-2 rounded-xl transition-colors ${
                isFavorited ? 'text-yellow-500' : 'text-gray-300 hover:text-yellow-400'
              }`}
              aria-label={isFavorited ? 'Retirer des favoris' : 'Ajouter aux favoris'}
            >
              <Star size={22} fill={isFavorited ? 'currentColor' : 'none'} />
            </button>
          )}
        </div>
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-2 mb-4">
        <Badge
          label={CONDITION_LABELS[fruitTree.condition] ?? fruitTree.condition}
          colorClasses={CONDITION_COLORS[fruitTree.condition]}
        />
        <Badge label={ACCESSIBILITY_LABELS[fruitTree.accessibility] ?? fruitTree.accessibility} />
      </div>

      {/* Infos */}
      <div className="space-y-3 mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <MapPin size={16} className="text-gray-400 flex-shrink-0" />
          <span>{fruitTree.address ? `${fruitTree.address}, ${fruitTree.city}` : fruitTree.city}</span>
        </div>

        {fruitTree.harvestMonths.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar size={16} className="text-gray-400 flex-shrink-0" />
            <span>Récolte : {formatHarvestMonths(fruitTree.harvestMonths)}</span>
          </div>
        )}
      </div>

      {/* Description */}
      <p className="text-gray-700 leading-relaxed mb-6">{fruitTree.description}</p>

      {/* Confirmations */}
      <div className="bg-forest-50 rounded-xl p-4 mb-6 flex items-center justify-between">
        <div>
          <p className="font-semibold text-forest-800">
            {fruitTree.confirmations} confirmation{fruitTree.confirmations > 1 ? 's' : ''}
          </p>
          <p className="text-xs text-forest-600 mt-0.5">Cet arbre a été vu par {fruitTree.confirmations} personne{fruitTree.confirmations > 1 ? 's' : ''}</p>
        </div>
        {isAuthenticated && (
          <button
            onClick={() => confirmMutation.mutate()}
            disabled={confirmMutation.isPending || confirmMutation.isSuccess}
            className="flex items-center gap-2 px-4 py-2 bg-forest-600 text-white text-sm rounded-lg hover:bg-forest-700 transition-colors disabled:opacity-60"
          >
            <CheckCircle size={16} />
            {confirmMutation.isSuccess ? 'Confirmé !' : 'J\'ai vu cet arbre'}
          </button>
        )}
      </div>

      {/* Métadonnées */}
      <div className="flex items-center justify-between text-xs text-gray-400 mb-6 py-4 border-t border-gray-100">
        <span>
          Signalé par <strong>{fruitTree.createdBy?.username ?? 'anonyme'}</strong>
          {' '}le {formatDate(fruitTree.createdAt)}
        </span>
        {isAuthenticated && (
          <button
            onClick={() => setIsReportModalOpen(true)}
            className="flex items-center gap-1 text-red-400 hover:text-red-600 transition-colors"
          >
            <AlertTriangle size={14} />
            Signaler une erreur
          </button>
        )}
      </div>

      {/* Commentaires */}
      <section>
        <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <MessageCircle size={18} className="text-gray-400" />
          Commentaires ({commentsResponse?.pagination.total ?? 0})
        </h2>

        {isAuthenticated ? (
          <form
            onSubmit={(submitEvent) => {
              submitEvent.preventDefault()
              if (commentContent.trim()) addCommentMutation.mutate()
            }}
            className="mb-6"
          >
            <textarea
              value={commentContent}
              onChange={(changeEvent) => setCommentContent(changeEvent.target.value)}
              rows={3}
              placeholder="Partagez votre expérience avec cet arbre…"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest-500 resize-none"
            />
            <div className="flex justify-end mt-2">
              <button
                type="submit"
                disabled={!commentContent.trim() || addCommentMutation.isPending}
                className="px-4 py-2 bg-forest-600 text-white text-sm rounded-lg hover:bg-forest-700 transition-colors disabled:opacity-60"
              >
                Commenter
              </button>
            </div>
          </form>
        ) : (
          <p className="text-sm text-gray-400 mb-4">
            <Link to="/login" className="text-forest-600 hover:underline">Connectez-vous</Link>{' '}
            pour laisser un commentaire.
          </p>
        )}

        <div className="space-y-4">
          {commentsResponse?.data.map((treeComment) => (
            <div key={treeComment.id} className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-forest-100 flex items-center justify-center text-sm font-bold text-forest-700 flex-shrink-0">
                {treeComment.user.username[0].toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-gray-900">{treeComment.user.username}</span>
                  <span className="text-xs text-gray-400">{formatDate(treeComment.createdAt)}</span>
                </div>
                <p className="text-sm text-gray-700">{treeComment.content}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Modal isOpen={isReportModalOpen} onClose={() => setIsReportModalOpen(false)} title="Signaler une erreur">
        <p className="text-sm text-gray-600 mb-4">
          Vous pensez que cet arbre n'existe plus, a été déplacé, ou que les informations sont incorrectes ?
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => setIsReportModalOpen(false)}
            className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm hover:bg-gray-50 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={() => reportMutation.mutate()}
            disabled={reportMutation.isPending}
            className="flex-1 py-2.5 bg-red-500 text-white rounded-xl text-sm hover:bg-red-600 transition-colors disabled:opacity-60"
          >
            {reportMutation.isPending ? 'Envoi…' : 'Confirmer le signalement'}
          </button>
        </div>
      </Modal>
    </div>
  )
}
