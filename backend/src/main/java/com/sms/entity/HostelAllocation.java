package com.sms.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Entity
@Table(name = "hostel_allocations")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HostelAllocation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "room_id", nullable = false)
    private HostelRoom room;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "student_id", nullable = false, unique = true)
    private Student student;

    @Column(nullable = false)
    private LocalDate allocationDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private HostelAllocationStatus status;
}
