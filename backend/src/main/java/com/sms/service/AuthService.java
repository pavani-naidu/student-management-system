package com.sms.service;

import com.sms.dto.JwtResponse;
import com.sms.dto.LoginRequest;
import com.sms.dto.RegisterRequest;
import com.sms.dto.ProfileDTO;
import com.sms.entity.User;
import com.sms.entity.Student;
import com.sms.entity.Teacher;
import com.sms.exception.DuplicateResourceException;
import com.sms.exception.ResourceNotFoundException;
import com.sms.repository.UserRepository;
import com.sms.repository.StudentRepository;
import com.sms.repository.TeacherRepository;
import com.sms.security.CustomUserDetailsService;
import com.sms.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final CustomUserDetailsService userDetailsService;
    private final JwtUtil jwtUtil;
    private final StudentRepository studentRepository;
    private final TeacherRepository teacherRepository;

    @Transactional
    public JwtResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("An account with this email already exists");
        }

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .enabled(true)
                .build();

        User saved = userRepository.save(user);
        UserDetails userDetails = userDetailsService.loadUserByUsername(saved.getEmail());
        String token = jwtUtil.generateToken(userDetails, saved.getId(), saved.getRole().name());

        return JwtResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .userId(saved.getId())
                .fullName(saved.getFullName())
                .email(saved.getEmail())
                .role(saved.getRole())
                .build();
    }

    public JwtResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalStateException("User disappeared after successful authentication"));

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String token = jwtUtil.generateToken(userDetails, user.getId(), user.getRole().name());

        return JwtResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .userId(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole())
                .build();
    }

    @Transactional(readOnly = true)
    public ProfileDTO getProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found for email: " + email));

        String mobileNumber = user.getMobileNumber();
        String address = user.getAddress();

        // Fallback check in student/teacher tables if fields are empty on the user
        if (mobileNumber == null || address == null) {
            if (user.getRole() == com.sms.entity.Role.STUDENT) {
                Optional<Student> studentOpt = studentRepository.findByUserEmail(email);
                if (studentOpt.isPresent()) {
                    Student s = studentOpt.get();
                    if (mobileNumber == null) mobileNumber = s.getMobileNumber();
                    if (address == null) address = s.getAddress();
                }
            } else if (user.getRole() == com.sms.entity.Role.TEACHER) {
                Optional<Teacher> teacherOpt = teacherRepository.findByEmail(email);
                if (teacherOpt.isPresent()) {
                    Teacher t = teacherOpt.get();
                    if (mobileNumber == null) mobileNumber = t.getMobileNumber();
                }
            }
        }

        return ProfileDTO.builder()
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole())
                .mobileNumber(mobileNumber)
                .address(address)
                .build();
    }

    @Transactional
    public ProfileDTO updateProfile(String email, ProfileDTO dto) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found for email: " + email));

        if (dto.getFullName() != null && !dto.getFullName().isBlank()) {
            user.setFullName(dto.getFullName());
        }
        user.setMobileNumber(dto.getMobileNumber());
        user.setAddress(dto.getAddress());

        // Sync with Student table if role is STUDENT
        if (user.getRole() == com.sms.entity.Role.STUDENT) {
            studentRepository.findByUserEmail(email).ifPresent(student -> {
                if (dto.getFullName() != null && !dto.getFullName().isBlank()) {
                    String[] parts = dto.getFullName().split("\\s+", 2);
                    student.setFirstName(parts[0]);
                    student.setLastName(parts.length > 1 ? parts[1] : "");
                }
                student.setMobileNumber(dto.getMobileNumber());
                student.setAddress(dto.getAddress());
                studentRepository.save(student);
            });
        }
        // Sync with Teacher table if role is TEACHER
        else if (user.getRole() == com.sms.entity.Role.TEACHER) {
            teacherRepository.findByEmail(email).ifPresent(teacher -> {
                if (dto.getFullName() != null && !dto.getFullName().isBlank()) {
                    String[] parts = dto.getFullName().split("\\s+", 2);
                    teacher.setFirstName(parts[0]);
                    teacher.setLastName(parts.length > 1 ? parts[1] : "");
                }
                teacher.setMobileNumber(dto.getMobileNumber());
                teacherRepository.save(teacher);
            });
        }

        // Handle password change if requested
        if (dto.getCurrentPassword() != null && !dto.getCurrentPassword().isBlank() &&
                dto.getNewPassword() != null && !dto.getNewPassword().isBlank()) {
            if (!passwordEncoder.matches(dto.getCurrentPassword(), user.getPassword())) {
                throw new IllegalArgumentException("Current password does not match");
            }
            user.setPassword(passwordEncoder.encode(dto.getNewPassword()));
        }

        User saved = userRepository.save(user);

        return ProfileDTO.builder()
                .fullName(saved.getFullName())
                .email(saved.getEmail())
                .role(saved.getRole())
                .mobileNumber(saved.getMobileNumber())
                .address(saved.getAddress())
                .build();
    }
}

