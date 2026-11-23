package com.placement.system.util;

import java.util.*;

/**
 * Single Source of Truth for the 4 Strict Industry-Standard Career Tracks.
 */
public class CareerStandard {

    public static final String JAVA_FULL_STACK = "Java Full Stack Developer";
    public static final String MERN_FULL_STACK = "MERN Full Stack Developer";
    public static final String AI_ML_ENGINEER = "AI / ML Engineer";
    public static final String DATA_ANALYST = "Data Analyst";

    public static final List<String> CANONICAL_CAREERS = List.of(
        JAVA_FULL_STACK,
        MERN_FULL_STACK,
        AI_ML_ENGINEER,
        DATA_ANALYST
    );

    public static boolean isValidCareer(String role) {
        if (role == null || role.isBlank()) return false;
        String normalized = role.trim();
        return CANONICAL_CAREERS.stream().anyMatch(c -> c.equalsIgnoreCase(normalized));
    }

    public static String canonicalizeRole(String role) {
        if (role == null || role.isBlank()) return JAVA_FULL_STACK;
        String r = role.trim().toLowerCase();
        if (r.contains("mern") || (r.contains("node") && r.contains("react"))) {
            return MERN_FULL_STACK;
        } else if (r.contains("ai") || r.contains("ml") || r.contains("machine learning") || r.contains("artificial")) {
            return AI_ML_ENGINEER;
        } else if (r.contains("data") && (r.contains("analyst") || r.contains("analytics") || r.contains("bi"))) {
            return DATA_ANALYST;
        } else {
            return JAVA_FULL_STACK;
        }
    }

    public static String getStandardDomain(String role) {
        String canonical = canonicalizeRole(role);
        return switch (canonical) {
            case MERN_FULL_STACK -> "Modern Web Architectures & Cloud-Native SaaS";
            case AI_ML_ENGINEER -> "Artificial Intelligence, Deep Learning & Predictive Systems";
            case DATA_ANALYST -> "Business Intelligence, Analytics & Quantitative Modeling";
            default -> "Enterprise Distributed Systems & Cloud Microservices";
        };
    }

    public static String getStandardIndustry(String role) {
        String canonical = canonicalizeRole(role);
        return switch (canonical) {
            case MERN_FULL_STACK -> "SaaS Platforms & High-Growth Startups";
            case AI_ML_ENGINEER -> "AI Labs & DeepTech Engineering";
            case DATA_ANALYST -> "Finance, E-Commerce & Analytics";
            default -> "Technology & Enterprise Software";
        };
    }

    public static Map<String, Double> getRoleWeights(String role) {
        String canonical = canonicalizeRole(role);
        return switch (canonical) {
            case MERN_FULL_STACK -> Map.of(
                "Web Frontend & React", 0.25,
                "Node.js & Backend Architecture", 0.25,
                "DBMS", 0.15,
                "Data Structures & Algorithms", 0.15,
                "OOP Concepts", 0.10,
                "Logical Reasoning", 0.10
            );
            case AI_ML_ENGINEER -> Map.of(
                "Machine Learning & Python", 0.30,
                "Data Structures & Algorithms", 0.20,
                "Quantitative Aptitude", 0.20,
                "DBMS", 0.15,
                "Logical Reasoning", 0.15
            );
            case DATA_ANALYST -> Map.of(
                "Data Analytics & BI (SQL/Tableau)", 0.30,
                "DBMS", 0.25,
                "Quantitative Aptitude", 0.15,
                "Logical Reasoning", 0.15,
                "Verbal Ability", 0.15
            );
            default -> Map.of(
                "Java & Spring Boot", 0.25,
                "Data Structures & Algorithms", 0.20,
                "DBMS", 0.15,
                "Web Frontend & React", 0.15,
                "OOP Concepts", 0.10,
                "Quantitative Aptitude", 0.15
            );
        };
    }

    public static Map<String, Integer> getRoleBenchmarks(String role) {
        String canonical = canonicalizeRole(role);
        return switch (canonical) {
            case MERN_FULL_STACK -> Map.of(
                "Web Frontend & React", 85,
                "Node.js & Backend Architecture", 80,
                "DBMS", 75,
                "Data Structures & Algorithms", 70,
                "OOP Concepts", 75,
                "Logical Reasoning", 70
            );
            case AI_ML_ENGINEER -> Map.of(
                "Machine Learning & Python", 85,
                "Data Structures & Algorithms", 75,
                "Quantitative Aptitude", 80,
                "DBMS", 70,
                "Logical Reasoning", 75
            );
            case DATA_ANALYST -> Map.of(
                "Data Analytics & BI (SQL/Tableau)", 85,
                "DBMS", 80,
                "Quantitative Aptitude", 75,
                "Logical Reasoning", 75,
                "Verbal Ability", 70
            );
            default -> Map.of(
                "Java & Spring Boot", 80,
                "Data Structures & Algorithms", 75,
                "DBMS", 75,
                "Web Frontend & React", 70,
                "OOP Concepts", 75,
                "Quantitative Aptitude", 70
            );
        };
    }
}
