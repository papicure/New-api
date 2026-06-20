package middleware

import (
	"encoding/json"
	"net/http"
	"net/url"

	"github.com/QuantumNous/new-api/common"
	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
)

type turnstileCheckResponse struct {
	Success bool `json:"success"`
}

// verifyCaptchaToken validates a captcha token against the given provider's
// siteverify endpoint. Cloudflare Turnstile and Google reCAPTCHA share the same
// POST form contract (secret + response + remoteip -> {success: bool}).
func verifyCaptchaToken(verifyURL, secret, response, remoteIP string) (bool, error) {
	rawRes, err := http.PostForm(verifyURL, url.Values{
		"secret":   {secret},
		"response": {response},
		"remoteip": {remoteIP},
	})
	if err != nil {
		return false, err
	}
	defer rawRes.Body.Close()
	var res turnstileCheckResponse
	if err := json.NewDecoder(rawRes.Body).Decode(&res); err != nil {
		return false, err
	}
	return res.Success, nil
}

func TurnstileCheck() gin.HandlerFunc {
	return func(c *gin.Context) {
		var verifyURL, secret string
		switch {
		case common.TurnstileCheckEnabled:
			verifyURL = "https://challenges.cloudflare.com/turnstile/v0/siteverify"
			secret = common.TurnstileSecretKey
		case common.RecaptchaCheckEnabled:
			verifyURL = "https://www.google.com/recaptcha/api/siteverify"
			secret = common.RecaptchaSecretKey
		case common.GeetestCheckEnabled:
			// Geetest uses a different protocol; handled separately below.
		default:
			c.Next()
			return
		}

		session := sessions.Default(c)
		turnstileChecked := session.Get("turnstile")
		if turnstileChecked != nil {
			c.Next()
			return
		}
		response := c.Query("turnstile")
		if response == "" {
			c.JSON(http.StatusOK, gin.H{
				"success": false,
				"message": "人机验证 token 为空",
			})
			c.Abort()
			return
		}

		var success bool
		if common.GeetestCheckEnabled {
			success = verifyGeetest(response, c.ClientIP())
		} else {
			var err error
			success, err = verifyCaptchaToken(verifyURL, secret, response, c.ClientIP())
			if err != nil {
				common.SysLog(err.Error())
				c.JSON(http.StatusOK, gin.H{
					"success": false,
					"message": err.Error(),
				})
				c.Abort()
				return
			}
		}
		if !success {
			c.JSON(http.StatusOK, gin.H{
				"success": false,
				"message": "人机验证失败，请刷新重试！",
			})
			c.Abort()
			return
		}
		session.Set("turnstile", true)
		if err := session.Save(); err != nil {
			c.JSON(http.StatusOK, gin.H{
				"message": "无法保存会话信息，请重试",
				"success": false,
			})
			return
		}
		c.Next()
	}
}

// geetestResult is the JSON payload the client packs into the shared turnstile
// query parameter for Geetest: the three fields returned by getValidate().
type geetestResult struct {
	Challenge string `json:"geetest_challenge"`
	Validate  string `json:"geetest_validate"`
	Seccode   string `json:"geetest_seccode"`
}

// verifyGeetest unpacks the three Geetest fields from the shared token channel
// and performs server-side validation.
func verifyGeetest(token, remoteIP string) bool {
	var result geetestResult
	if err := common.UnmarshalJsonStr(token, &result); err != nil {
		return false
	}
	return common.GeetestVerify(result.Challenge, result.Validate, result.Seccode, remoteIP)
}
