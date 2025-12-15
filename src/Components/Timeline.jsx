import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Timeline({ events }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedEvents, setSelectedEvents] = useState(new Set());

  const eventsPerPage = 3;
  const totalPages = Math.ceil(events.length / eventsPerPage);
  const currentEvents = events.slice(currentIndex, currentIndex + eventsPerPage);

  const handleNext = () => {
    if (currentIndex + eventsPerPage < events.length) {
      setCurrentIndex(currentIndex + eventsPerPage);
    }
  };

  const handlePrevious = () => {
    if (currentIndex - eventsPerPage >= 0) {
      setCurrentIndex(currentIndex - eventsPerPage);
    }
  };

  const toggleEvent = (eventId) => {
    setSelectedEvents((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(eventId)) {
        newSet.delete(eventId);
      } else {
        newSet.add(eventId);
      }
      return newSet;
    });
  };

  const selectedEventsInOrder = events.filter((event) => selectedEvents.has(event.id));

  return (
    <div className="bg-white rounded-xl shadow-md p-8 border border-gray-100">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Timeline of Events</h2>

      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-gray-700" />
          </button>

          <div className="flex-1 mx-4">
            <div className="relative">
              <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 -translate-y-1/2" />
              <div className="relative flex justify-between">
                {currentEvents.map((event) => (
                  <button
                    key={event.id}
                    onClick={() => toggleEvent(event.id)}
                    className={`flex flex-col items-center transition-all duration-200 ${
                      selectedEvents.has(event.id) ? 'scale-110' : 'hover:scale-105'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full border-4 bg-white transition-colors ${
                        selectedEvents.has(event.id)
                          ? 'border-gray-800'
                          : 'border-gray-400 hover:border-gray-600'
                      }`}
                    />
                    <div className="mt-3 text-center max-w-[120px]">
                      <div
                        className={`text-xs font-semibold mb-1 ${
                          selectedEvents.has(event.id) ? 'text-gray-900' : 'text-gray-600'
                        }`}
                      >
                        {event.date_label}
                      </div>
                      <div
                        className={`text-xs ${
                          selectedEvents.has(event.id) ? 'text-gray-800 font-medium' : 'text-gray-500'
                        }`}
                      >
                        {event.title}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={handleNext}
            disabled={currentIndex + eventsPerPage >= events.length}
            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-6 h-6 text-gray-700" />
          </button>
        </div>

        <div className="text-center text-sm text-gray-500">
          Page {Math.floor(currentIndex / eventsPerPage) + 1} of {totalPages}
        </div>
      </div>

      {selectedEventsInOrder.length > 0 && (
        <div className="space-y-6 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Event Details (Chronological Order)</h3>
          {selectedEventsInOrder.map((event) => (
            <div
              key={event.id}
              className="p-6 bg-gray-50 rounded-lg border border-gray-200"
            >
              <div className="flex items-start justify-between mb-3">
                <h4 className="text-lg font-semibold text-gray-900">{event.title}</h4>
                <span className="px-3 py-1 bg-gray-800 text-white text-sm rounded-full font-medium">
                  {event.date_label}
                </span>
              </div>
              <p className="text-gray-700 leading-relaxed">{event.explanation}</p>
            </div>
          ))}
        </div>
      )}

      {selectedEventsInOrder.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          Click on timeline events above to view their explanations
        </div>
      )}
    </div>
  );
}
