package com.sms.service;

import com.sms.dto.NoticeDTO;
import com.sms.entity.Notice;
import com.sms.entity.User;
import com.sms.exception.ResourceNotFoundException;
import com.sms.repository.NoticeRepository;
import com.sms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NoticeService {

    private final NoticeRepository noticeRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<NoticeDTO> getNoticesForUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found for email: " + email));

        List<Notice> notices;
        switch (user.getRole()) {
            case ADMIN:
                notices = noticeRepository.findByOrderByPublishedDateDesc();
                break;
            case TEACHER:
                notices = noticeRepository.findByTargetAudienceInOrderByPublishedDateDesc(List.of("ALL", "TEACHERS"));
                break;
            case STUDENT:
                notices = noticeRepository.findByTargetAudienceInOrderByPublishedDateDesc(List.of("ALL", "STUDENTS"));
                break;
            default:
                notices = List.of();
        }

        return notices.stream().map(this::toDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public NoticeDTO getById(Long id) {
        Notice notice = noticeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notice not found with id: " + id));
        return toDto(notice);
    }

    @Transactional
    public NoticeDTO create(NoticeDTO dto, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found for email: " + email));

        Notice notice = Notice.builder()
                .title(dto.getTitle())
                .content(dto.getContent())
                .publishedDate(dto.getPublishedDate() != null ? dto.getPublishedDate() : LocalDate.now())
                .targetAudience(dto.getTargetAudience())
                .postedBy(user.getFullName())
                .build();

        Notice saved = noticeRepository.save(notice);
        return toDto(saved);
    }

    @Transactional
    public NoticeDTO update(Long id, NoticeDTO dto) {
        Notice notice = noticeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notice not found with id: " + id));

        notice.setTitle(dto.getTitle());
        notice.setContent(dto.getContent());
        if (dto.getPublishedDate() != null) {
            notice.setPublishedDate(dto.getPublishedDate());
        }
        notice.setTargetAudience(dto.getTargetAudience());

        Notice saved = noticeRepository.save(notice);
        return toDto(saved);
    }

    @Transactional
    public void delete(Long id) {
        if (!noticeRepository.existsById(id)) {
            throw new ResourceNotFoundException("Notice not found with id: " + id);
        }
        noticeRepository.deleteById(id);
    }

    private NoticeDTO toDto(Notice notice) {
        return NoticeDTO.builder()
                .id(notice.getId())
                .title(notice.getTitle())
                .content(notice.getContent())
                .publishedDate(notice.getPublishedDate())
                .targetAudience(notice.getTargetAudience())
                .postedBy(notice.getPostedBy())
                .build();
    }
}
