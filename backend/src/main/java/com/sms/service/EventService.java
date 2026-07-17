package com.sms.service;

import com.sms.dto.EventDTO;
import com.sms.entity.Event;
import com.sms.exception.ResourceNotFoundException;
import com.sms.repository.EventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EventService {

    private final EventRepository eventRepository;

    @Transactional(readOnly = true)
    public List<EventDTO> getAll() {
        return eventRepository.findByOrderByEventDateAsc().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public EventDTO getById(Long id) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with id: " + id));
        return toDto(event);
    }

    @Transactional
    public EventDTO create(EventDTO dto) {
        Event event = Event.builder()
                .title(dto.getTitle())
                .description(dto.getDescription())
                .eventDate(dto.getEventDate())
                .location(dto.getLocation())
                .organizer(dto.getOrganizer())
                .build();

        Event saved = eventRepository.save(event);
        return toDto(saved);
    }

    @Transactional
    public EventDTO update(Long id, EventDTO dto) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with id: " + id));

        event.setTitle(dto.getTitle());
        event.setDescription(dto.getDescription());
        event.setEventDate(dto.getEventDate());
        event.setLocation(dto.getLocation());
        event.setOrganizer(dto.getOrganizer());

        Event saved = eventRepository.save(event);
        return toDto(saved);
    }

    @Transactional
    public void delete(Long id) {
        if (!eventRepository.existsById(id)) {
            throw new ResourceNotFoundException("Event not found with id: " + id);
        }
        eventRepository.deleteById(id);
    }

    private EventDTO toDto(Event event) {
        return EventDTO.builder()
                .id(event.getId())
                .title(event.getTitle())
                .description(event.getDescription())
                .eventDate(event.getEventDate())
                .location(event.getLocation())
                .organizer(event.getOrganizer())
                .build();
    }
}
