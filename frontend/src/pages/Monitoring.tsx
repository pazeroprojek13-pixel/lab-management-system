import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Select } from '../components/ui/Select';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { useFetch } from '../hooks/useFetch';
import { useForm } from '../hooks/useForm';
import { eventsApi } from '../api/events';
import { inventoryApi } from '../api/inventory';
import { useAuth } from '../contexts/AuthContext';

interface TimeSlot {
  time: string;
  events: Array<{
    id: string;
    title: string;
    location: string;
    startDate: string;
    endDate: string;
  }>;
}

export function Monitoring() {
  const { hasRole } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedLab, setSelectedLab] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: eventsData, execute: refetchEvents } = useFetch(() => eventsApi.getAll());
  const { data: labsData } = useFetch(() => inventoryApi.getAllLabs());

  const labOptions = labsData?.labs.map(lab => ({ value: lab.id, label: lab.name })) || [];

  // Generate time slots (8 AM to 8 PM)
  const timeSlots = Array.from({ length: 13 }, (_, i) => {
    const hour = i + 8;
    return `${hour.toString().padStart(2, '0')}:00`;
  });

  // Filter events for selected date and lab
  const filteredEvents = eventsData?.events.filter(event => {
    const eventDate = new Date(event.startDate).toISOString().split('T')[0];
    const matchesDate = eventDate === selectedDate;
    const matchesLab = selectedLab ? event.location === labsData?.labs.find(l => l.id === selectedLab)?.name : true;
    return matchesDate && matchesLab;
  }) || [];

  const eventForm = useForm({
    initialValues: {
      title: '',
      description: '',
      startDate: '',
      endDate: '',
      location: '',
    },
    onSubmit: async (values) => {
      await eventsApi.create({
        ...values,
        startDate: new Date(values.startDate).toISOString(),
        endDate: new Date(values.endDate).toISOString(),
      });
      setIsModalOpen(false);
      eventForm.reset();
      refetchEvents();
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Daily Monitoring</h1>
          <p className="text-gray-500 mt-1">View and manage lab schedules</p>
        </div>
        {hasRole('ADMIN', 'LAB_ASSISTANT') && (
          <Button onClick={() => setIsModalOpen(true)}>+ Add Event</Button>
        )}
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div className="flex-1">
            <Select
              label="Filter by Lab"
              value={selectedLab}
              onChange={(e) => setSelectedLab(e.target.value)}
              options={[{ value: '', label: 'All Labs' }, ...labOptions]}
            />
          </div>
        </div>
      </Card>

      {/* Time Grid */}
      <Card>
        <div className="overflow-x-auto">
          <div className="min-w-[600px]">
            {/* Header */}
            <div className="grid grid-cols-12 gap-2 mb-4 pb-2 border-b border-gray-200">
              <div className="col-span-2 font-medium text-gray-500">Time</div>
              <div className="col-span-10 font-medium text-gray-500">Events</div>
            </div>

            {/* Time Slots */}
            <div className="space-y-2">
              {timeSlots.map((time) => {
                const slotEvents = filteredEvents.filter(event => {
                  const eventHour = new Date(event.startDate).getHours();
                  const slotHour = parseInt(time.split(':')[0]);
                  return eventHour === slotHour;
                });

                return (
                  <div key={time} className="grid grid-cols-12 gap-2 items-start">
                    <div className="col-span-2 py-3 text-sm font-medium text-gray-600">
                      {time}
                    </div>
                    <div className="col-span-10 min-h-[60px] p-2 bg-gray-50 rounded-lg">
                      {slotEvents.length > 0 ? (
                        <div className="space-y-2">
                          {slotEvents.map(event => (
                            <div
                              key={event.id}
                              className="p-2 bg-primary-50 border border-primary-200 rounded-md cursor-pointer hover:bg-primary-100 transition-colors"
                            >
                              <p className="font-medium text-primary-900 text-sm">{event.title}</p>
                              <p className="text-xs text-primary-600">{event.location}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">No events</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </Card>

      {/* Add Event Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add New Event"
      >
        <form onSubmit={eventForm.handleSubmit} className="space-y-4">
          <Input
            label="Event Title"
            name="title"
            value={eventForm.values.title}
            onChange={eventForm.handleChange}
            required
          />
          <Input
            label="Description"
            name="description"
            value={eventForm.values.description}
            onChange={eventForm.handleChange}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Start Date & Time"
              name="startDate"
              type="datetime-local"
              value={eventForm.values.startDate}
              onChange={eventForm.handleChange}
              required
            />
            <Input
              label="End Date & Time"
              name="endDate"
              type="datetime-local"
              value={eventForm.values.endDate}
              onChange={eventForm.handleChange}
              required
            />
          </div>
          <Select
            label="Location"
            name="location"
            value={eventForm.values.location}
            onChange={eventForm.handleChange}
            options={labOptions}
            required
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={eventForm.isSubmitting}
            >
              Create Event
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
