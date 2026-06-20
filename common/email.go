package common

import (
	"crypto/tls"
	"encoding/base64"
	"fmt"
	"net/smtp"
	"slices"
	"strings"
	"time"
)

// BuildBrandedEmail wraps the given inner HTML body in a branded, email-client
// safe HTML shell styled after the warm "cream + terracotta" Claude Code look.
// Uses table-based layout and inline styles for maximum mail-client support.
// preheader is the short hidden summary line shown in inbox previews.
func BuildBrandedEmail(heading string, preheader string, innerHTML string) string {
	brand := SystemName
	if brand == "" {
		brand = "New API"
	}

	logoBlock := fmt.Sprintf(
		`<span style="display:inline-block;font-family:Georgia,'Times New Roman',serif;font-size:22px;font-weight:700;color:#D97757;letter-spacing:0.2px;">%s</span>`,
		htmlEscapeText(brand),
	)
	if Logo != "" {
		logoBlock = fmt.Sprintf(
			`<img src="%s" alt="%s" height="36" style="display:inline-block;height:36px;max-height:36px;border:0;outline:none;text-decoration:none;" />`,
			Logo, htmlEscapeText(brand),
		)
	}

	footerText := Footer
	if footerText == "" {
		footerText = fmt.Sprintf("&copy; %s · %s", time.Now().Format("2006"), htmlEscapeText(brand))
	}

	return fmt.Sprintf(`<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta name="x-apple-disable-message-reformatting" />
<title>%[1]s</title>
</head>
<body style="margin:0;padding:0;background-color:#F0EADD;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;font-size:1px;line-height:1px;color:#F0EADD;">%[2]s</div>
<table role="presentation" width="100%%" cellpadding="0" cellspacing="0" border="0" style="background-color:#F0EADD;margin:0;padding:0;">
<tr>
<td align="center" style="padding:32px 16px;">
<table role="presentation" width="100%%" cellpadding="0" cellspacing="0" border="0" style="max-width:520px;width:100%%;">
<tr>
<td align="center" style="padding:8px 4px 24px 4px;">%[3]s</td>
</tr>
<tr>
<td style="background-color:#FFFDF7;border:1px solid #E7DFCF;border-radius:16px;padding:40px 36px;box-shadow:0 1px 2px rgba(61,58,52,0.04);">
<h1 style="margin:0 0 20px 0;font-family:Georgia,'Times New Roman',serif;font-size:22px;line-height:1.35;font-weight:700;color:#2B2925;">%[4]s</h1>
<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:15px;line-height:1.7;color:#4A463F;">%[5]s</div>
</td>
</tr>
<tr>
<td align="center" style="padding:24px 16px 4px 16px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:12px;line-height:1.6;color:#9A9384;">%[6]s</td>
</tr>
</table>
</td>
</tr>
</table>
</body>
</html>`, htmlEscapeText(heading), htmlEscapeText(preheader), logoBlock, htmlEscapeText(heading), innerHTML, footerText)
}

// htmlEscapeText escapes a string for safe inclusion in HTML text/attributes.
func htmlEscapeText(s string) string {
	r := strings.NewReplacer(
		"&", "&amp;",
		"<", "&lt;",
		">", "&gt;",
		`"`, "&quot;",
		"'", "&#39;",
	)
	return r.Replace(s)
}

// EmailVerificationCodeBadge renders a verification code as a prominent,
// brand-styled badge for use inside BuildBrandedEmail bodies.
func EmailVerificationCodeBadge(code string) string {
	return fmt.Sprintf(
		`<div style="margin:24px 0;text-align:center;"><span style="display:inline-block;font-family:'SF Mono',SFMono-Regular,Consolas,'Liberation Mono',Menlo,monospace;font-size:30px;font-weight:700;letter-spacing:8px;color:#D97757;background-color:#FBF1E9;border:1px solid #F0D9C8;border-radius:12px;padding:14px 28px;">%s</span></div>`,
		htmlEscapeText(code),
	)
}

// EmailPrimaryButton renders a terracotta call-to-action button linking to url.
func EmailPrimaryButton(label string, url string) string {
	return fmt.Sprintf(
		`<div style="margin:24px 0;text-align:center;"><a href="%s" target="_blank" style="display:inline-block;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:15px;font-weight:600;color:#FFFFFF;background-color:#D97757;text-decoration:none;border-radius:10px;padding:13px 32px;">%s</a></div>`,
		url, htmlEscapeText(label),
	)
}

func generateMessageID() (string, error) {
	split := strings.Split(SMTPFrom, "@")
	if len(split) < 2 {
		return "", fmt.Errorf("invalid SMTP account")
	}
	domain := strings.Split(SMTPFrom, "@")[1]
	return fmt.Sprintf("<%d.%s@%s>", time.Now().UnixNano(), GetRandomString(12), domain), nil
}

func shouldUseSMTPLoginAuth() bool {
	if SMTPForceAuthLogin {
		return true
	}
	return isOutlookServer(SMTPAccount) || slices.Contains(EmailLoginAuthServerList, SMTPServer)
}

func getSMTPAuth() smtp.Auth {
	if shouldUseSMTPLoginAuth() {
		return LoginAuth(SMTPAccount, SMTPToken)
	}
	return smtp.PlainAuth("", SMTPAccount, SMTPToken, SMTPServer)
}

func SendEmail(subject string, receiver string, content string) error {
	if SMTPFrom == "" { // for compatibility
		SMTPFrom = SMTPAccount
	}
	id, err2 := generateMessageID()
	if err2 != nil {
		return err2
	}
	if SMTPServer == "" && SMTPAccount == "" {
		return fmt.Errorf("SMTP 服务器未配置")
	}
	encodedSubject := fmt.Sprintf("=?UTF-8?B?%s?=", base64.StdEncoding.EncodeToString([]byte(subject)))
	mail := []byte(fmt.Sprintf("To: %s\r\n"+
		"From: %s <%s>\r\n"+
		"Subject: %s\r\n"+
		"Date: %s\r\n"+
		"Message-ID: %s\r\n"+ // 添加 Message-ID 头
		"Content-Type: text/html; charset=UTF-8\r\n\r\n%s\r\n",
		receiver, SystemName, SMTPFrom, encodedSubject, time.Now().Format(time.RFC1123Z), id, content))
	auth := getSMTPAuth()
	addr := fmt.Sprintf("%s:%d", SMTPServer, SMTPPort)
	to := strings.Split(receiver, ";")
	var err error
	if SMTPPort == 465 || SMTPSSLEnabled {
		tlsConfig := &tls.Config{
			InsecureSkipVerify: true,
			ServerName:         SMTPServer,
		}
		conn, err := tls.Dial("tcp", fmt.Sprintf("%s:%d", SMTPServer, SMTPPort), tlsConfig)
		if err != nil {
			return err
		}
		client, err := smtp.NewClient(conn, SMTPServer)
		if err != nil {
			return err
		}
		defer client.Close()
		if err = client.Auth(auth); err != nil {
			return err
		}
		if err = client.Mail(SMTPFrom); err != nil {
			return err
		}
		receiverEmails := strings.Split(receiver, ";")
		for _, receiver := range receiverEmails {
			if err = client.Rcpt(receiver); err != nil {
				return err
			}
		}
		w, err := client.Data()
		if err != nil {
			return err
		}
		_, err = w.Write(mail)
		if err != nil {
			return err
		}
		err = w.Close()
		if err != nil {
			return err
		}
	} else {
		err = smtp.SendMail(addr, auth, SMTPFrom, to, mail)
	}
	if err != nil {
		SysError(fmt.Sprintf("failed to send email to %s: %v", receiver, err))
	}
	return err
}
