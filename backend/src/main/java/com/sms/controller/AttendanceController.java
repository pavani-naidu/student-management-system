package com.sms.controller;

import com.sms.dto.ApiResponse;
import com.sms.dto.AttendanceDTO;
import com.sms.dto.BulkAttendanceDTO;
import com.sms.dto.MyAttendanceResponse;
import com.sms.dto.StudentStatsDTO;
import com.sms.service.AttendanceService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/attendance")
@RequiredArgsConstructor
@Tag(name = "Attendance", description = "Attendance Management endpoints")
public class AttendanceController {

    private final AttendanceService attendanceService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<ApiResponse<List<AttendanceDTO>>> search(
            @RequestParam(required = false) Long departmentId,
            @RequestParam(required = false) Long courseId,
            @RequestParam(required = false) Long studentId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        List<AttendanceDTO> result = attendanceService.search(departmentId, courseId, studentId, date);
        return ResponseEntity.ok(ApiResponse.success("Attendance records fetched successfully", result));
    }

    @PostMapping("/bulk")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<ApiResponse<List<AttendanceDTO>>> bulkSave(@RequestBody BulkAttendanceDTO dto) {
        List<AttendanceDTO> result = attendanceService.bulkSave(dto.getDate(), dto.getRecords());
        return ResponseEntity.ok(ApiResponse.success("Attendance marked successfully", result));
    }

    @GetMapping("/student/{studentId}/stats")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<ApiResponse<StudentStatsDTO>> getStudentStats(@PathVariable Long studentId) {
        StudentStatsDTO stats = attendanceService.getStudentStats(studentId);
        return ResponseEntity.ok(ApiResponse.success("Student stats fetched successfully", stats));
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<MyAttendanceResponse>> getMyAttendance() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        MyAttendanceResponse response = attendanceService.getMyAttendance(email);
        return ResponseEntity.ok(ApiResponse.success("My attendance history and stats fetched successfully", response));
    }
}
