package common

import (
	"crypto/md5"
	"encoding/hex"
	"io"
	"net/http"
	"net/url"
	"strings"
	"time"
)

// Geetest (极验) behavior CAPTCHA v3 integration.
//
// v3 uses a two-step challenge-response protocol that differs from the shared
// siteverify contract used by Cloudflare Turnstile and Google reCAPTCHA:
//  1. Register: the server asks api.geetest.com/register.php for a challenge,
//     then returns MD5(challenge + key) to the client so the widget can init.
//  2. Validate: after the user solves the slider the client returns three
//     fields (challenge / validate / seccode); the server verifies them
//     locally and against api.geetest.com/validate.php.
//
// We deliberately do NOT implement failback (offline) downgrade: if Geetest is
// unreachable, registration fails and the client cannot render the widget,
// which blocks submission. This matches the "block on failure" policy.

const (
	geetestRegisterURL = "https://api.geetest.com/register.php"
	geetestValidateURL = "https://api.geetest.com/validate.php"
)

var geetestClient = &http.Client{Timeout: 10 * time.Second}

func geetestMD5(input string) string {
	sum := md5.Sum([]byte(input))
	return hex.EncodeToString(sum[:])
}

// GeetestRegister requests a challenge from Geetest and returns the processed
// challenge (MD5(challenge + key)) for the client to initialize the widget.
// Returns ok=false when Geetest is unreachable or returns an invalid challenge,
// so the caller can block instead of falling back to offline mode.
func GeetestRegister(userIP string) (challenge string, ok bool) {
	params := url.Values{}
	params.Add("gt", GeetestId)
	params.Add("new_captcha", "1")
	if userIP != "" {
		params.Add("ip_address", userIP)
	}
	resp, err := geetestClient.Get(geetestRegisterURL + "?" + params.Encode())
	if err != nil {
		SysLog("geetest register failed: " + err.Error())
		return "", false
	}
	defer resp.Body.Close()
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		SysLog("geetest register read failed: " + err.Error())
		return "", false
	}
	raw := strings.TrimSpace(string(body))
	if len(raw) != 32 {
		SysLog("geetest register returned invalid challenge")
		return "", false
	}
	return geetestMD5(raw + GeetestKey), true
}

// GeetestVerify performs the server-side validation of a solved Geetest
// challenge. It first checks the local signature MD5(key+"geetest"+challenge)
// == validate, then confirms with validate.php that the response equals
// MD5(seccode).
func GeetestVerify(challenge, validate, seccode, userIP string) bool {
	if challenge == "" || validate == "" || seccode == "" {
		return false
	}
	if geetestMD5(GeetestKey+"geetest"+challenge) != validate {
		return false
	}
	params := url.Values{}
	params.Add("seccode", seccode)
	params.Add("challenge", challenge)
	params.Add("captchaid", GeetestId)
	params.Add("sdk", "golang_newapi")
	if userIP != "" {
		params.Add("ip_address", userIP)
	}
	resp, err := geetestClient.PostForm(geetestValidateURL, params)
	if err != nil {
		SysLog("geetest validate failed: " + err.Error())
		return false
	}
	defer resp.Body.Close()
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		SysLog("geetest validate read failed: " + err.Error())
		return false
	}
	return strings.TrimSpace(string(body)) == geetestMD5(seccode)
}
