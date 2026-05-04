/**
 * Event Bus - Communication entre Micro-Frontends
 *
 * Pattern Pub/Sub simple et efficace.
 *
 * Usage:
 *   import eventBus from 'shared/eventBus';
 *
 *   // S'abonner
 *   eventBus.on('event:name', (data) => console.log(data));
 *
 *   // Emettre
 *   eventBus.emit('event:name', { key: 'value' });
 *
 *   // Se desabonner
 *   eventBus.off('event:name', callback);
 */

class EventBus {
  constructor() {
    this.listeners = {};
  }

  /**
   * S'abonner a un evenement
   * @param {string} event - Nom de l'evenement
   * @param {Function} callback - Fonction a appeler
   * @returns {Function} Fonction pour se desabonner
   */
  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);

    // Retourne une fonction pour se desabonner facilement
    return () => this.off(event, callback);
  }

  /**
   * Se desabonner d'un evenement
   * @param {string} event - Nom de l'evenement
   * @param {Function} callback - Fonction a retirer
   */
  off(event, callback) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
  }

  /**
   * Emettre un evenement
   * @param {string} event - Nom de l'evenement
   * @param {any} data - Donnees a transmettre
   */
  emit(event, data) {
    if (!this.listeners[event]) return;

    // Log pour debug
    console.log(`[EventBus] ${event}`, data);

    this.listeners[event].forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`[EventBus] Error in listener for ${event}:`, error);
      }
    });
  }

  /**
   * S'abonner une seule fois
   * @param {string} event - Nom de l'evenement
   * @param {Function} callback - Fonction a appeler
   */
  once(event, callback) {
    const wrapper = (data) => {
      callback(data);
      this.off(event, wrapper);
    };
    this.on(event, wrapper);
  }
}

// Singleton global - partage entre tous les MFEs
if (!window.__EVENT_BUS__) {
  window.__EVENT_BUS__ = new EventBus();
}

export default window.__EVENT_BUS__;
