export default function DeleteModal({ resource, onConfirm, onClose }) {
  if (!resource) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
            <span className="text-xl">⚠️</span>
          </div>
          <div>
            <h3 className="font-bold text-gray-800">Delete Resource</h3>
            <p className="text-xs text-gray-400">This action cannot be undone</p>
          </div>
        </div>

        <div className="px-6 py-5">
          {/* Warning banner */}
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-5">
            <p className="text-red-600 font-semibold text-sm mb-1">⚠️ Warning: Permanent Deletion</p>
            <p className="text-red-500 text-xs">You are about to permanently delete this resource. This action cannot be undone, and all data associated with this resource will be lost.</p>
          </div>

          {/* Resource details */}
          <div className="bg-gray-50 rounded-xl p-4 mb-5 text-sm">
            <p className="text-xs text-gray-400 uppercase font-semibold mb-3">Resource Details</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-gray-400">NAME</p>
                <p className="font-semibold text-gray-800">{resource.name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">TYPE</p>
                <p className="font-semibold text-gray-800">{resource.type}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">DEPARTMENT</p>
                <p className="font-semibold text-gray-800">{resource.department}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">RATING</p>
                <p className="font-semibold text-gray-800">⭐ {resource.rating}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">VIEWS</p>
                <p className="font-semibold text-gray-800">{resource.views}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">DATE ADDED</p>
                <p className="font-semibold text-gray-800">{resource.dateAdded}</p>
              </div>
            </div>
            <div className="mt-3">
              <p className="text-xs text-gray-400">UNLOCK CONDITION</p>
              <p className="font-semibold text-gray-800">{resource.unlockCondition}</p>
            </div>
          </div>

          <p className="text-center text-gray-500 text-sm mb-5">Are you absolutely sure you want to delete this resource?</p>

          <div className="flex gap-3">
            <button
              onClick={onConfirm}
              className="flex-1 py-3 rounded-xl bg-red-500 text-white font-semibold text-sm hover:bg-red-600 transition-colors shadow"
            >
              🗑️ Yes, Delete Resource
            </button>
            <button
              onClick={onClose}
              className="px-5 py-3 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
