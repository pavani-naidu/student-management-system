package com.sms.controller;

import com.sms.dto.ApiResponse;
import com.sms.dto.EventDTO;
import com.sms.service.EventService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
@Tag(name = "Events", description = "Events Management endpoints")
public class EventController {

    private final EventService eventService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'STUDENT')")
    public ResponseEntity<ApiResponse<List<EventDTO>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success("Events fetched successfully", eventService.getAll()));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'STUDENT')")
    public ResponseEntity<ApiResponse<EventDTO>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Event fetched successfully", eventService.getById(id)));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<EventDTO>> create(@RequestBody EventDTO dto) {
        return ResponseEntity.ok(ApiResponse.success("Event created successfully", eventService.create(dto)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<EventDTO>> update(@PathVariable Long id, @RequestBody EventDTO dto) {
        return ResponseEntity.ok(ApiResponse.success("Event updated successfully", eventService.update(id, dto)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        eventService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Event deleted successfully", null));
    }
}
