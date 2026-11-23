import React from 'react';
import { AlertTriangle } from 'lucide-react';

export default function AdminDeleteConfirmModal({
  item,
  type, // 'question' | 'category'
  onConfirm,
  onCancel
}) {
  if (!item) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4 border border-gray-200 text-center">
        <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-base font-black text-gray-900">
            {type === 'question' ? 'Delete Question?' : 'Delete Assignment Suite?'}
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            {type === 'question'
              ? 'Are you sure you want to permanently remove this question from the active assessment repository?'
              : `This will permanently remove ${item.name} and all questions linked to it.`}
          </p>
          {type === 'question' && (
            <div className="mt-3 p-2 bg-gray-50 rounded-xl border border-gray-200 text-xs text-gray-700 text-left line-clamp-2 italic font-mono">
              "{item.questionText}"
            </div>
          )}
        </div>
        <div className="flex gap-2 justify-center pt-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-100 rounded-xl border border-gray-200 cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs cursor-pointer"
          >
            {type === 'question' ? 'Delete Permanently' : 'Delete Suite'}
          </button>
        </div>
      </div>
    </div>
  );
}
