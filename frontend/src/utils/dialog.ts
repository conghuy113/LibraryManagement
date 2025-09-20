/**
 * Custom dialog utilities to replace browser's default confirm/alert
 * with custom title "Library Management says"
 */

// Since we can't change the browser's default dialog title,
// we'll create custom modal dialogs
export const showConfirm = (message: string): Promise<boolean> => {
  return new Promise((resolve) => {
    // Create modal overlay
    const overlay = document.createElement('div');
    overlay.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]';
    
    // Create modal
    const modal = document.createElement('div');
    modal.className = 'bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl';
    
    modal.innerHTML = `
      <div class="flex items-center gap-3 mb-4">
        <div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
          <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
          </svg>
        </div>
        <h3 class="text-lg font-semibold text-gray-900">Library Management says</h3>
      </div>
      <p class="text-gray-700 mb-6">${message}</p>
      <div class="flex gap-3 justify-end">
        <button id="cancel-btn" class="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
          Cancel
        </button>
        <button id="ok-btn" class="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors">
          OK
        </button>
      </div>
    `;
    
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    
    // Add event listeners
    const cancelBtn = modal.querySelector('#cancel-btn');
    const okBtn = modal.querySelector('#ok-btn');
    
    const cleanup = () => {
      document.body.removeChild(overlay);
    };
    
    cancelBtn?.addEventListener('click', () => {
      cleanup();
      resolve(false);
    });
    
    okBtn?.addEventListener('click', () => {
      cleanup();
      resolve(true);
    });
    
    // Close on overlay click
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        cleanup();
        resolve(false);
      }
    });
    
    // Focus OK button
    (okBtn as HTMLElement)?.focus();
  });
};

export const showAlert = (message: string): Promise<void> => {
  return new Promise((resolve) => {
    // Create modal overlay
    const overlay = document.createElement('div');
    overlay.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]';
    
    // Create modal
    const modal = document.createElement('div');
    modal.className = 'bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl';
    
    modal.innerHTML = `
      <div class="flex items-center gap-3 mb-4">
        <div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
          <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
          </svg>
        </div>
        <h3 class="text-lg font-semibold text-gray-900">Library Management says</h3>
      </div>
      <p class="text-gray-700 mb-6">${message}</p>
      <div class="flex justify-end">
        <button id="ok-btn" class="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors">
          OK
        </button>
      </div>
    `;
    
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    
    // Add event listeners
    const okBtn = modal.querySelector('#ok-btn');
    
    const cleanup = () => {
      document.body.removeChild(overlay);
    };
    
    okBtn?.addEventListener('click', () => {
      cleanup();
      resolve();
    });
    
    // Close on overlay click
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        cleanup();
        resolve();
      }
    });
    
    // Focus OK button
    (okBtn as HTMLElement)?.focus();
  });
};