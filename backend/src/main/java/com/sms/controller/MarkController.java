package com.sms.controller;

import com.sms.dto.ApiResponse;
import com.sms.dto.BulkMarkDTO;
import com.sms.dto.MarkDTO;
import com.sms.dto.MyMarksResponse;
import com.sms.dto.StudentMarkStatsDTO;
import com.sms.service.MarkService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/marks")
@RequiredArgsConstructor
@Tag(name = "Marks", description = "Marks Management endpoints")
public class MarkController {

    private final MarkService markService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<ApiResponse<List<MarkDTO>>> search(
            @RequestParam(required = false) Long courseId,
            @RequestParam(required = false) Long examId,
            @RequestParam(required = false) Long studentId
    ) {
        List<MarkDTO> result = markService.search(courseId, examId, studentId);
        return ResponseEntity.ok(ApiResponse.success("Marks fetched successfully", result));
    }

    @PostMapping("/bulk")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<ApiResponse<List<MarkDTO>>> bulkSave(@RequestBody BulkMarkDTO dto) {
        List<MarkDTO> result = markService.bulkSave(dto);
        return ResponseEntity.ok(ApiResponse.success("Marks saved successfully", result));
    }

    @GetMapping("/student/{studentId}/stats")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<ApiResponse<StudentMarkStatsDTO>> getStudentStats(@PathVariable Long studentId) {
        StudentMarkStatsDTO stats = markService.getStudentStats(studentId);
        return ResponseEntity.ok(ApiResponse.success("Student mark statistics fetched successfully", stats));
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<MyMarksResponse>> getMyMarks() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        MyMarksResponse response = markService.getMyMarks(email);
        return ResponseEntity.ok(ApiResponse.success("My marks and statistics fetched successfully", response));
    }
}
