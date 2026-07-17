package com.sms.service;

import com.sms.dto.TimetableEntryDTO;
import com.sms.entity.Course;
import com.sms.entity.Student;
import com.sms.entity.TimetableEntry;
import com.sms.exception.ResourceNotFoundException;
import com.sms.repository.CourseRepository;
import com.sms.repository.StudentRepository;
import com.sms.repository.TimetableRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TimetableService {

    private final TimetableRepository timetableRepository;
    private final CourseRepository courseRepository;
    private final StudentRepository studentRepository;

    @Transactional(readOnly = true)
    public List<TimetableEntryDTO> getAll() {
        return timetableRepository.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TimetableEntryDTO> getByCourseId(Long courseId) {
        return timetableRepository.findByCourseIdOrderByDayOfWeekAscStartTimeAsc(courseId).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public TimetableEntryDTO getById(Long id) {
        TimetableEntry entry = timetableRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Timetable entry not found with id: " + id));
        return toDto(entry);
    }

    @Transactional
    public TimetableEntryDTO create(TimetableEntryDTO dto) {
        Course course = courseRepository.findById(dto.getCourseId())
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + dto.getCourseId()));

        TimetableEntry entry = TimetableEntry.builder()
                .course(course)
                .dayOfWeek(dto.getDayOfWeek())
                .startTime(dto.getStartTime())
                .endTime(dto.getEndTime())
                .subject(dto.getSubject())
                .teacherName(dto.getTeacherName())
                .roomNumber(dto.getRoomNumber())
                .build();

        TimetableEntry saved = timetableRepository.save(entry);
        return toDto(saved);
    }

    @Transactional
    public TimetableEntryDTO update(Long id, TimetableEntryDTO dto) {
        TimetableEntry entry = timetableRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Timetable entry not found with id: " + id));

        Course course = courseRepository.findById(dto.getCourseId())
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + dto.getCourseId()));

        entry.setCourse(course);
        entry.setDayOfWeek(dto.getDayOfWeek());
        entry.setStartTime(dto.getStartTime());
        entry.setEndTime(dto.getEndTime());
        entry.setSubject(dto.getSubject());
        entry.setTeacherName(dto.getTeacherName());
        entry.setRoomNumber(dto.getRoomNumber());

        TimetableEntry saved = timetableRepository.save(entry);
        return toDto(saved);
    }

    @Transactional
    public void delete(Long id) {
        if (!timetableRepository.existsById(id)) {
            throw new ResourceNotFoundException("Timetable entry not found with id: " + id);
        }
        timetableRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public List<TimetableEntryDTO> getMyTimetable(String email) {
        Student student = studentRepository.findByUserEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found for user: " + email));

        if (student.getCourse() == null) {
            return new ArrayList<>();
        }

        return getByCourseId(student.getCourse().getId());
    }

    private TimetableEntryDTO toDto(TimetableEntry entry) {
        return TimetableEntryDTO.builder()
                .id(entry.getId())
                .courseId(entry.getCourse().getId())
                .courseName(entry.getCourse().getName())
                .dayOfWeek(entry.getDayOfWeek())
                .startTime(entry.getStartTime())
                .endTime(entry.getEndTime())
                .subject(entry.getSubject())
                .teacherName(entry.getTeacherName())
                .roomNumber(entry.getRoomNumber())
                .build();
    }
}
