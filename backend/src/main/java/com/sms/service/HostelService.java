package com.sms.service;

import com.sms.dto.HostelAllocationDTO;
import com.sms.dto.HostelRoomDTO;
import com.sms.entity.HostelAllocation;
import com.sms.entity.HostelAllocationStatus;
import com.sms.entity.HostelRoom;
import com.sms.entity.Student;
import com.sms.exception.DuplicateResourceException;
import com.sms.exception.ResourceNotFoundException;
import com.sms.repository.HostelAllocationRepository;
import com.sms.repository.HostelRoomRepository;
import com.sms.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HostelService {

    private final HostelRoomRepository roomRepository;
    private final HostelAllocationRepository allocationRepository;
    private final StudentRepository studentRepository;

    // --- Room CRUD ---

    @Transactional(readOnly = true)
    public List<HostelRoomDTO> getAllRooms() {
        return roomRepository.findAll().stream()
                .map(this::toRoomDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public HostelRoomDTO getRoomById(Long id) {
        HostelRoom room = roomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Hostel room not found with id: " + id));
        return toRoomDto(room);
    }

    @Transactional
    public HostelRoomDTO createRoom(HostelRoomDTO dto) {
        if (roomRepository.existsByBlockNameAndRoomNumber(dto.getBlockName(), dto.getRoomNumber())) {
            throw new DuplicateResourceException("Room " + dto.getRoomNumber() + " in Block " + dto.getBlockName() + " already exists");
        }
        HostelRoom room = HostelRoom.builder()
                .blockName(dto.getBlockName())
                .roomNumber(dto.getRoomNumber())
                .roomType(dto.getRoomType())
                .capacity(dto.getCapacity())
                .occupiedCount(0)
                .build();
        return toRoomDto(roomRepository.save(room));
    }

    @Transactional
    public HostelRoomDTO updateRoom(Long id, HostelRoomDTO dto) {
        HostelRoom room = roomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Hostel room not found with id: " + id));

        if (!(room.getBlockName().equals(dto.getBlockName()) && room.getRoomNumber().equals(dto.getRoomNumber()))
                && roomRepository.existsByBlockNameAndRoomNumber(dto.getBlockName(), dto.getRoomNumber())) {
            throw new DuplicateResourceException("Room " + dto.getRoomNumber() + " in Block " + dto.getBlockName() + " already exists");
        }

        if (dto.getCapacity() < room.getOccupiedCount()) {
            throw new IllegalArgumentException("Cannot set capacity below currently occupied count: " + room.getOccupiedCount());
        }

        room.setBlockName(dto.getBlockName());
        room.setRoomNumber(dto.getRoomNumber());
        room.setRoomType(dto.getRoomType());
        room.setCapacity(dto.getCapacity());

        return toRoomDto(roomRepository.save(room));
    }

    @Transactional
    public void deleteRoom(Long id) {
        HostelRoom room = roomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Hostel room not found with id: " + id));
        if (room.getOccupiedCount() > 0) {
            throw new IllegalArgumentException("Cannot delete hostel room that currently has occupants");
        }
        roomRepository.delete(room);
    }

    // --- Allocation CRUD ---

    @Transactional(readOnly = true)
    public List<HostelAllocationDTO> getAllAllocations() {
        return allocationRepository.findAll().stream()
                .map(this::toAllocationDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public HostelAllocationDTO allocateRoom(HostelAllocationDTO dto) {
        HostelRoom room = roomRepository.findById(dto.getRoomId())
                .orElseThrow(() -> new ResourceNotFoundException("Hostel room not found with id: " + dto.getRoomId()));
        Student student = studentRepository.findById(dto.getStudentId())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + dto.getStudentId()));

        allocationRepository.findByStudentId(student.getId()).ifPresent(alloc -> {
            if (alloc.getStatus() == HostelAllocationStatus.ALLOCATED) {
                throw new DuplicateResourceException("Student is already allocated to Room " + alloc.getRoom().getRoomNumber() + " in Block " + alloc.getRoom().getBlockName());
            }
        });

        if (room.getOccupiedCount() >= room.getCapacity()) {
            throw new IllegalArgumentException("Room capacity is fully occupied");
        }

        HostelAllocation allocation = HostelAllocation.builder()
                .room(room)
                .student(student)
                .allocationDate(dto.getAllocationDate())
                .status(HostelAllocationStatus.ALLOCATED)
                .build();

        room.setOccupiedCount(room.getOccupiedCount() + 1);
        roomRepository.save(room);

        return toAllocationDto(allocationRepository.save(allocation));
    }

    @Transactional
    public HostelAllocationDTO updateAllocation(Long id, HostelAllocationDTO dto) {
        HostelAllocation allocation = allocationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Allocation record not found with id: " + id));

        HostelRoom newRoom = roomRepository.findById(dto.getRoomId())
                .orElseThrow(() -> new ResourceNotFoundException("Hostel room not found with id: " + dto.getRoomId()));

        if (!allocation.getRoom().getId().equals(newRoom.getId())) {
            if (allocation.getStatus() == HostelAllocationStatus.ALLOCATED) {
                HostelRoom oldRoom = allocation.getRoom();
                oldRoom.setOccupiedCount(Math.max(0, oldRoom.getOccupiedCount() - 1));
                roomRepository.save(oldRoom);
            }

            if (dto.getStatus() == HostelAllocationStatus.ALLOCATED) {
                if (newRoom.getOccupiedCount() >= newRoom.getCapacity()) {
                    throw new IllegalArgumentException("Target room is fully occupied");
                }
                newRoom.setOccupiedCount(newRoom.getOccupiedCount() + 1);
                roomRepository.save(newRoom);
            }
            allocation.setRoom(newRoom);
        } else {
            if (allocation.getStatus() == HostelAllocationStatus.ALLOCATED && dto.getStatus() == HostelAllocationStatus.VACATED) {
                HostelRoom room = allocation.getRoom();
                room.setOccupiedCount(Math.max(0, room.getOccupiedCount() - 1));
                roomRepository.save(room);
            } else if (allocation.getStatus() == HostelAllocationStatus.VACATED && dto.getStatus() == HostelAllocationStatus.ALLOCATED) {
                HostelRoom room = allocation.getRoom();
                if (room.getOccupiedCount() >= room.getCapacity()) {
                    throw new IllegalArgumentException("Room capacity is fully occupied");
                }
                room.setOccupiedCount(room.getOccupiedCount() + 1);
                roomRepository.save(room);
            }
        }

        allocation.setAllocationDate(dto.getAllocationDate());
        allocation.setStatus(dto.getStatus());

        return toAllocationDto(allocationRepository.save(allocation));
    }

    @Transactional
    public void deleteAllocation(Long id) {
        HostelAllocation allocation = allocationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Allocation record not found with id: " + id));

        if (allocation.getStatus() == HostelAllocationStatus.ALLOCATED) {
            HostelRoom room = allocation.getRoom();
            room.setOccupiedCount(Math.max(0, room.getOccupiedCount() - 1));
            roomRepository.save(room);
        }

        allocationRepository.delete(allocation);
    }

    @Transactional(readOnly = true)
    public HostelAllocationDTO getMyAllocation(String email) {
        Student student = studentRepository.findByUserEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found for email: " + email));

        HostelAllocation allocation = allocationRepository.findByStudentId(student.getId())
                .orElseThrow(() -> new ResourceNotFoundException("No hostel allocation found for current student"));

        return toAllocationDto(allocation);
    }

    private HostelRoomDTO toRoomDto(HostelRoom room) {
        HostelRoomDTO dto = new HostelRoomDTO();
        dto.setId(room.getId());
        dto.setBlockName(room.getBlockName());
        dto.setRoomNumber(room.getRoomNumber());
        dto.setRoomType(room.getRoomType());
        dto.setCapacity(room.getCapacity());
        dto.setOccupiedCount(room.getOccupiedCount());
        return dto;
    }

    private HostelAllocationDTO toAllocationDto(HostelAllocation allocation) {
        HostelAllocationDTO dto = new HostelAllocationDTO();
        dto.setId(allocation.getId());
        dto.setRoomId(allocation.getRoom().getId());
        dto.setBlockName(allocation.getRoom().getBlockName());
        dto.setRoomNumber(allocation.getRoom().getRoomNumber());
        dto.setRoomType(allocation.getRoom().getRoomType());
        dto.setStudentId(allocation.getStudent().getId());
        dto.setStudentRoll(allocation.getStudent().getRollNumber());
        dto.setStudentName(allocation.getStudent().getFirstName() + " " + allocation.getStudent().getLastName());
        dto.setAllocationDate(allocation.getAllocationDate());
        dto.setStatus(allocation.getStatus());
        return dto;
    }
}
