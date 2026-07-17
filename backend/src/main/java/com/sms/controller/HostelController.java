package com.sms.controller;

import com.sms.dto.ApiResponse;
import com.sms.dto.HostelAllocationDTO;
import com.sms.dto.HostelRoomDTO;
import com.sms.service.HostelService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/hostel")
@RequiredArgsConstructor
@Tag(name = "Hostel", description = "Hostel room definition and student room allocation management")
public class HostelController {

    private final HostelService hostelService;

    // --- Hostel Room endpoints ---

    @GetMapping("/rooms")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<HostelRoomDTO>>> getAllRooms() {
        return ResponseEntity.ok(ApiResponse.success("Hostel rooms fetched successfully", hostelService.getAllRooms()));
    }

    @GetMapping("/rooms/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<HostelRoomDTO>> getRoomById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Hostel room fetched successfully", hostelService.getRoomById(id)));
    }

    @PostMapping("/rooms")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<HostelRoomDTO>> createRoom(@Valid @RequestBody HostelRoomDTO dto) {
        return ResponseEntity.ok(ApiResponse.success("Hostel room created successfully", hostelService.createRoom(dto)));
    }

    @PutMapping("/rooms/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<HostelRoomDTO>> updateRoom(@PathVariable Long id, @Valid @RequestBody HostelRoomDTO dto) {
        return ResponseEntity.ok(ApiResponse.success("Hostel room updated successfully", hostelService.updateRoom(id, dto)));
    }

    @DeleteMapping("/rooms/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteRoom(@PathVariable Long id) {
        hostelService.deleteRoom(id);
        return ResponseEntity.ok(ApiResponse.success("Hostel room deleted successfully", null));
    }

    // --- Hostel Allocation endpoints ---

    @GetMapping("/allocations")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<HostelAllocationDTO>>> getAllAllocations() {
        return ResponseEntity.ok(ApiResponse.success("Hostel allocations fetched successfully", hostelService.getAllAllocations()));
    }

    @PostMapping("/allocations")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<HostelAllocationDTO>> allocateRoom(@Valid @RequestBody HostelAllocationDTO dto) {
        return ResponseEntity.ok(ApiResponse.success("Hostel room allocated successfully", hostelService.allocateRoom(dto)));
    }

    @PutMapping("/allocations/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<HostelAllocationDTO>> updateAllocation(@PathVariable Long id, @Valid @RequestBody HostelAllocationDTO dto) {
        return ResponseEntity.ok(ApiResponse.success("Hostel allocation updated successfully", hostelService.updateAllocation(id, dto)));
    }

    @DeleteMapping("/allocations/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteAllocation(@PathVariable Long id) {
        hostelService.deleteAllocation(id);
        return ResponseEntity.ok(ApiResponse.success("Hostel allocation deleted successfully", null));
    }

    @GetMapping("/my-allocation")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<HostelAllocationDTO>> getMyAllocation() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(ApiResponse.success("My hostel allocation fetched successfully", hostelService.getMyAllocation(email)));
    }
}
