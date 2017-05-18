package app.api

import app.util.*
import org.springframework.http.ResponseEntity
import org.springframework.http.ResponseEntity.ok
import org.springframework.web.bind.annotation.*
import app.util.getLogger
import nl.martijndwars.webpush.Notification
import nl.martijndwars.webpush.PushService
import org.apache.http.util.EntityUtils
import org.bouncycastle.jce.provider.BouncyCastleProvider
import java.security.Security


/**
 *
 * @author nsoushi
 */
@RestController
@RequestMapping(value = "/push")
class PushController() {

    val log = getLogger(PushController::class)

    val publicKey = "BOH8nTQA5iZhl23+NCzGG9prvOZ5BE0MJXBW+GUkQIvRVTVB32JxmX0V1j6z0r7rnT7+bgi6f2g5fMPpAh5brqM="
    val privateKey = "TRlY/7yQzvqcLpgHQTxiU5fVzAAvAw/cdSh5kLFLNqg="

    @CrossOrigin(origins = arrayOf("http://localhost"))
    @PostMapping
    fun post(@RequestBody req: Request): ResponseEntity<Boolean> {

        val payload  = objectMapper().writeValueAsString(Payload(req.message, req.tag, req.icon, req.url))

        Security.addProvider(BouncyCastleProvider())
        val push = PushService(publicKey, privateKey, "http://localhost")
        val response = push.send(Notification(req.endpoint, req.key, req.auth, payload))

        log.info("endpoint:%s".format(req.endpoint))
        log.info("status:%d".format(response.statusLine.statusCode))
        log.info("body:%s".format( EntityUtils.toString(response.entity)))

        return ok().json().body(true)
    }

    @CrossOrigin(origins = arrayOf("http://localhost"))
    @GetMapping("public-key")
    fun get(): String {
        return publicKey
    }

    data class Payload(
            val body: String,
            val tag: String?,
            val icon: String,
            val url: String?)

    data class Request(
            val endpoint: String,
            val key: String,
            val auth: String,
            val message: String,
            val tag: String?,
            val icon: String,
            val url:String?)
}