package com.sms.controller;

import com.sms.dto.ApiResponse;
import com.sms.dto.NoticeDTO;
import com.sms.service.NoticeService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notices")
@RequiredArgsConstructor
@Tag(name = "Notices", description = "Notice Board Management endpoints")
public class NoticeController {

    private final NoticeService noticeService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'STUDENT')")
    public ResponseEntity<ApiResponse<List<NoticeDTO>>> getNotices() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        List<NoticeDTO> notices = noticeService.getNoticesForUser(email);
        return ResponseEntity.ok(ApiResponse.success("Notices fetched successfully", notices));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'STUDENT')")
    public ResponseEntity<ApiResponse<NoticeDTO>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Notice fetched successfully", noticeService.getById(id)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<ApiResponse<NoticeDTO>> create(@RequestBody NoticeDTO dto) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(ApiResponse.success("Notice created successfully", noticeService.create(dto, email)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<ApiResponse<NoticeDTO>> update(@PathVariable Long id, @RequestBody NoticeDTO dto) {
        return ResponseEntity.ok(ApiResponse.success("Notice updated successfully", noticeService.update(id, dto)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        noticeService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Notice deleted successfully", null));
    }
}
