package com.sms.controller;

import com.sms.dto.ApiResponse;
import com.sms.dto.TimetableEntryDTO;
import com.sms.service.TimetableService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/timetable")
@RequiredArgsConstructor
@Tag(name = "Timetable", description = "Timetable Management endpoints")
public class TimetableController {

    private final TimetableService timetableService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'STUDENT')")
    public ResponseEntity<ApiResponse<List<TimetableEntryDTO>>> getAll(@RequestParam(required = false) Long courseId) {
        List<TimetableEntryDTO> entries;
        if (courseId != null) {
            entries = timetableService.getByCourseId(courseId);
        } else {
            entries = timetableService.getAll();
        }
        return ResponseEntity.ok(ApiResponse.success("Timetable entries fetched successfully", entries));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'STUDENT')")
    public ResponseEntity<ApiResponse<TimetableEntryDTO>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Timetable entry fetched successfully", timetableService.getById(id)));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<TimetableEntryDTO>> create(@RequestBody TimetableEntryDTO dto) {
        return ResponseEntity.ok(ApiResponse.success("Timetable entry created successfully", timetableService.create(dto)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<TimetableEntryDTO>> update(@PathVariable Long id, @RequestBody TimetableEntryDTO dto) {
        return ResponseEntity.ok(ApiResponse.success("Timetable entry updated successfully", timetableService.update(id, dto)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        timetableService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Timetable entry deleted successfully", null));
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<List<TimetableEntryDTO>>> getMyTimetable() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        List<TimetableEntryDTO> entries = timetableService.getMyTimetable(email);
        return ResponseEntity.ok(ApiResponse.success("My timetable fetched successfully", entries));
    }
}
