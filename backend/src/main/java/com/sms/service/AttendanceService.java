package com.sms.service;

import com.sms.dto.AttendanceDTO;
import com.sms.dto.BulkAttendanceDTO;
import com.sms.dto.MyAttendanceResponse;
import com.sms.dto.StudentStatsDTO;
import com.sms.entity.Attendance;
import com.sms.entity.Student;
import com.sms.exception.ResourceNotFoundException;
import com.sms.repository.AttendanceRepository;
import com.sms.repository.StudentRepository;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final StudentRepository studentRepository;

    @Transactional
    public List<AttendanceDTO> bulkSave(LocalDate date, List<BulkAttendanceDTO.Record> records) {
        List<AttendanceDTO> savedDtos = new ArrayList<>();
        for (BulkAttendanceDTO.Record record : records) {
            Student student = studentRepository.findById(record.getStudentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + record.getStudentId()));

            Optional<Attendance> existingOpt = attendanceRepository.findByStudentIdAndDate(record.getStudentId(), date);
            Attendance attendance;
            if (existingOpt.isPresent()) {
                attendance = existingOpt.get();
                attendance.setStatus(record.getStatus());
                attendance.setRemarks(record.getRemarks());
            } else {
                attendance = Attendance.builder()
                        .student(student)
                        .date(date)
                        .status(record.getStatus())
                        .remarks(record.getRemarks())
                        .build();
            }
            Attendance saved = attendanceRepository.save(attendance);
            savedDtos.add(toDto(saved));
        }
        return savedDtos;
    }

    @Transactional(readOnly = true)
    public List<AttendanceDTO> search(Long departmentId, Long courseId, Long studentId, LocalDate date) {
        Specification<Attendance> spec = (root, cq, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (departmentId != null) {
                predicates.add(cb.equal(root.get("student").get("department").get("id"), departmentId));
            }
            if (courseId != null) {
                predicates.add(cb.equal(root.get("student").get("course").get("id"), courseId));
            }
            if (studentId != null) {
                predicates.add(cb.equal(root.get("student").get("id"), studentId));
            }
            if (date != null) {
                predicates.add(cb.equal(root.get("date"), date));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };
        return attendanceRepository.findAll(spec).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public StudentStatsDTO getStudentStats(Long studentId) {
        if (!studentRepository.existsById(studentId)) {
            throw new ResourceNotFoundException("Student not found with id: " + studentId);
        }
        long presentCount = attendanceRepository.countByStudentIdAndStatus(studentId, Attendance.Status.PRESENT);
        long totalCount = attendanceRepository.countByStudentId(studentId);
        long absentCount = totalCount - presentCount;
        double percentage = totalCount > 0 ? ((double) presentCount / totalCount) * 100.0 : 100.0;
        percentage = Math.round(percentage * 100.0) / 100.0;

        return StudentStatsDTO.builder()
                .presentCount(presentCount)
                .absentCount(absentCount)
                .totalCount(totalCount)
                .attendancePercentage(percentage)
                .build();
    }

    @Transactional(readOnly = true)
    public MyAttendanceResponse getMyAttendance(String email) {
        Student student = studentRepository.findByUserEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found for user: " + email));

        StudentStatsDTO stats = getStudentStats(student.getId());
        List<AttendanceDTO> history = attendanceRepository.findByStudentIdOrderByDateDesc(student.getId())
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());

        return MyAttendanceResponse.builder()
                .stats(stats)
                .history(history)
                .build();
    }

    public AttendanceDTO toDto(Attendance attendance) {
        AttendanceDTO dto = new AttendanceDTO();
        dto.setId(attendance.getId());
        dto.setStudentId(attendance.getStudent().getId());
        dto.setStudentRollNumber(attendance.getStudent().getRollNumber());
        dto.setStudentFirstName(attendance.getStudent().getFirstName());
        dto.setStudentLastName(attendance.getStudent().getLastName());
        dto.setDate(attendance.getDate());
        dto.setStatus(attendance.getStatus());
        dto.setRemarks(attendance.getRemarks());
        return dto;
    }
}
