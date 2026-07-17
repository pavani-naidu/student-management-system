package com.sms.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "hostel_rooms", uniqueConstraints = @UniqueConstraint(columnNames = {"blockName", "roomNumber"}))
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HostelRoom {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String blockName;

    @Column(nullable = false)
    private String roomNumber;

    private String roomType;

    private Integer capacity;

    private Integer occupiedCount;
}
