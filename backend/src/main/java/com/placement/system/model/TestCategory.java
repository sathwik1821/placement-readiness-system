package com.placement.system.model;

import jakarta.persistence.*;

@Entity
@Table(name = "test_categories")
public class TestCategory {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    private String name;
    private String type; // COMMON, TECHNICAL
    private String domain = "";
    private String description = "";

    public TestCategory() {}

    public TestCategory(String name, String type, String domain, String description) {
        this.name = name;
        this.type = type;
        this.domain = domain;
        this.description = description;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getDomain() { return domain; }
    public void setDomain(String domain) { this.domain = domain; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}
