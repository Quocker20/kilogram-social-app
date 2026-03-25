package com.kilogram.backendcore.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target({ElementType.FIELD})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = AdultValidator.class)
public @interface Adult {
    String message() default  "Bạn cần đủ tối thiểu 18 tuổi";
    Class<?>[] groups() default{};
    Class<? extends Payload>[] payload() default {};

    int minAge() default 18;

}
