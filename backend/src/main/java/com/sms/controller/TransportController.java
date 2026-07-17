package com.sms.controller;

import com.sms.dto.ApiResponse;
import com.sms.dto.TransportAllocationDTO;
import com.sms.dto.TransportRouteDTO;
import com.sms.service.TransportService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transport")
@RequiredArgsConstructor
@Tag(name = "Transport", description = "Transport route planning and student transport allocation management")
public class TransportController {

    private final TransportService transportService;

    // --- Transport Route endpoints ---

    @GetMapping("/routes")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<TransportRouteDTO>>> getAllRoutes() {
        return ResponseEntity.ok(ApiResponse.success("Transport routes fetched successfully", transportService.getAllRoutes()));
    }

    @GetMapping("/routes/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<TransportRouteDTO>> getRouteById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Transport route fetched successfully", transportService.getRouteById(id)));
    }

    @PostMapping("/routes")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<TransportRouteDTO>> createRoute(@Valid @RequestBody TransportRouteDTO dto) {
        return ResponseEntity.ok(ApiResponse.success("Transport route created successfully", transportService.createRoute(dto)));
    }

    @PutMapping("/routes/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<TransportRouteDTO>> updateRoute(@PathVariable Long id, @Valid @RequestBody TransportRouteDTO dto) {
        return ResponseEntity.ok(ApiResponse.success("Transport route updated successfully", transportService.updateRoute(id, dto)));
    }

    @DeleteMapping("/routes/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteRoute(@PathVariable Long id) {
        transportService.deleteRoute(id);
        return ResponseEntity.ok(ApiResponse.success("Transport route deleted successfully", null));
    }

    // --- Transport Allocation endpoints ---

    @GetMapping("/allocations")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<TransportAllocationDTO>>> getAllAllocations() {
        return ResponseEntity.ok(ApiResponse.success("Transport allocations fetched successfully", transportService.getAllAllocations()));
    }

    @PostMapping("/allocations")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<TransportAllocationDTO>> allocateRoute(@Valid @RequestBody TransportAllocationDTO dto) {
        return ResponseEntity.ok(ApiResponse.success("Transport route allocated successfully", transportService.allocateRoute(dto)));
    }

    @PutMapping("/allocations/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<TransportAllocationDTO>> updateAllocation(@PathVariable Long id, @Valid @RequestBody TransportAllocationDTO dto) {
        return ResponseEntity.ok(ApiResponse.success("Transport allocation updated successfully", transportService.updateAllocation(id, dto)));
    }

    @DeleteMapping("/allocations/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteAllocation(@PathVariable Long id) {
        transportService.deleteAllocation(id);
        return ResponseEntity.ok(ApiResponse.success("Transport allocation deleted successfully", null));
    }

    @GetMapping("/my-route")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<TransportAllocationDTO>> getMyRoute() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(ApiResponse.success("My transport route allocation fetched successfully", transportService.getMyRoute(email)));
    }
}
