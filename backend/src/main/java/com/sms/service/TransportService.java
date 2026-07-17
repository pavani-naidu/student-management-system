package com.sms.service;

import com.sms.dto.TransportAllocationDTO;
import com.sms.dto.TransportRouteDTO;
import com.sms.entity.Student;
import com.sms.entity.TransportAllocation;
import com.sms.entity.TransportRoute;
import com.sms.exception.DuplicateResourceException;
import com.sms.exception.ResourceNotFoundException;
import com.sms.repository.StudentRepository;
import com.sms.repository.TransportAllocationRepository;
import com.sms.repository.TransportRouteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TransportService {

    private final TransportRouteRepository routeRepository;
    private final TransportAllocationRepository allocationRepository;
    private final StudentRepository studentRepository;

    // --- Route CRUD ---

    @Transactional(readOnly = true)
    public List<TransportRouteDTO> getAllRoutes() {
        return routeRepository.findAll().stream()
                .map(this::toRouteDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public TransportRouteDTO getRouteById(Long id) {
        TransportRoute route = routeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transport route not found with id: " + id));
        return toRouteDto(route);
    }

    @Transactional
    public TransportRouteDTO createRoute(TransportRouteDTO dto) {
        TransportRoute route = TransportRoute.builder()
                .routeName(dto.getRouteName())
                .vehicleNumber(dto.getVehicleNumber())
                .driverName(dto.getDriverName())
                .driverMobile(dto.getDriverMobile())
                .fee(dto.getFee())
                .build();
        return toRouteDto(routeRepository.save(route));
    }

    @Transactional
    public TransportRouteDTO updateRoute(Long id, TransportRouteDTO dto) {
        TransportRoute route = routeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transport route not found with id: " + id));

        route.setRouteName(dto.getRouteName());
        route.setVehicleNumber(dto.getVehicleNumber());
        route.setDriverName(dto.getDriverName());
        route.setDriverMobile(dto.getDriverMobile());
        route.setFee(dto.getFee());

        return toRouteDto(routeRepository.save(route));
    }

    @Transactional
    public void deleteRoute(Long id) {
        TransportRoute route = routeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transport route not found with id: " + id));
        boolean hasAllocations = allocationRepository.findAll().stream()
                .anyMatch(alloc -> alloc.getRoute().getId().equals(id));
        if (hasAllocations) {
            throw new IllegalArgumentException("Cannot delete route that has students allocated");
        }
        routeRepository.delete(route);
    }

    // --- Allocation CRUD ---

    @Transactional(readOnly = true)
    public List<TransportAllocationDTO> getAllAllocations() {
        return allocationRepository.findAll().stream()
                .map(this::toAllocationDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public TransportAllocationDTO allocateRoute(TransportAllocationDTO dto) {
        TransportRoute route = routeRepository.findById(dto.getRouteId())
                .orElseThrow(() -> new ResourceNotFoundException("Transport route not found with id: " + dto.getRouteId()));
        Student student = studentRepository.findById(dto.getStudentId())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + dto.getStudentId()));

        if (allocationRepository.existsByStudentId(student.getId())) {
            throw new DuplicateResourceException("Student is already allocated to a transport route");
        }

        TransportAllocation allocation = TransportAllocation.builder()
                .route(route)
                .student(student)
                .pickupPoint(dto.getPickupPoint())
                .allocationDate(dto.getAllocationDate())
                .build();

        return toAllocationDto(allocationRepository.save(allocation));
    }

    @Transactional
    public TransportAllocationDTO updateAllocation(Long id, TransportAllocationDTO dto) {
        TransportAllocation allocation = allocationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Allocation record not found with id: " + id));

        TransportRoute route = routeRepository.findById(dto.getRouteId())
                .orElseThrow(() -> new ResourceNotFoundException("Transport route not found with id: " + dto.getRouteId()));

        allocation.setRoute(route);
        allocation.setPickupPoint(dto.getPickupPoint());
        allocation.setAllocationDate(dto.getAllocationDate());

        return toAllocationDto(allocationRepository.save(allocation));
    }

    @Transactional
    public void deleteAllocation(Long id) {
        TransportAllocation allocation = allocationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Allocation record not found with id: " + id));
        allocationRepository.delete(allocation);
    }

    @Transactional(readOnly = true)
    public TransportAllocationDTO getMyRoute(String email) {
        Student student = studentRepository.findByUserEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found for email: " + email));

        TransportAllocation allocation = allocationRepository.findByStudentId(student.getId())
                .orElseThrow(() -> new ResourceNotFoundException("No transport allocation found for current student"));

        return toAllocationDto(allocation);
    }

    private TransportRouteDTO toRouteDto(TransportRoute route) {
        TransportRouteDTO dto = new TransportRouteDTO();
        dto.setId(route.getId());
        dto.setRouteName(route.getRouteName());
        dto.setVehicleNumber(route.getVehicleNumber());
        dto.setDriverName(route.getDriverName());
        dto.setDriverMobile(route.getDriverMobile());
        dto.setFee(route.getFee());
        return dto;
    }

    private TransportAllocationDTO toAllocationDto(TransportAllocation allocation) {
        TransportAllocationDTO dto = new TransportAllocationDTO();
        dto.setId(allocation.getId());
        dto.setRouteId(allocation.getRoute().getId());
        dto.setRouteName(allocation.getRoute().getRouteName());
        dto.setVehicleNumber(allocation.getRoute().getVehicleNumber());
        dto.setStudentId(allocation.getStudent().getId());
        dto.setStudentRoll(allocation.getStudent().getRollNumber());
        dto.setStudentName(allocation.getStudent().getFirstName() + " " + allocation.getStudent().getLastName());
        dto.setPickupPoint(allocation.getPickupPoint());
        dto.setAllocationDate(allocation.getAllocationDate());
        return dto;
    }
}
