package app.util

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.module.kotlin.KotlinModule
import org.slf4j.LoggerFactory
import org.springframework.boot.SpringApplication
import org.springframework.http.ResponseEntity
import kotlin.reflect.KClass

/**
 *
 * @author nsoushi
 */
fun run(type: KClass<*>, vararg args: String) = SpringApplication.run(type.java, *args)

fun ResponseEntity.BodyBuilder.json() = contentType(org.springframework.http.MediaType.APPLICATION_JSON_UTF8)

fun objectMapper() = ObjectMapper().registerModule(KotlinModule())

fun <T : Any> getLogger(type: KClass<T>) = LoggerFactory.getLogger(type.java)
