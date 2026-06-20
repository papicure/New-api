package controller

// epusdt_compat_test.go cross-verifies that the go-epay client embedded in
// new-api produces signatures byte-for-byte identical to what the epusdt
// gateway computes on its side. epusdt exposes an EPAY-compatible endpoint
// (/payments/epay/v1/order/create-transaction/submit.php) and signs callbacks
// with the same MD5(sorted "k=v&...") + secret scheme. This test reimplements
// epusdt's util/sign.MapToParams independently and asserts equality, so any
// future drift in either signing path fails loudly instead of silently
// breaking live payments.

import (
	"crypto/md5"
	"fmt"
	"net/url"
	"sort"
	"strconv"
	"testing"

	"github.com/Calcium-Ion/go-epay/epay"
	"github.com/stretchr/testify/require"
)

// epusdtMapToParams mirrors epusdt's src/util/sign/sign.go:MapToParams exactly:
// skip the "signature" key and any empty value, render each value, sort the
// "k=v" entries lexicographically, and join with "&".
func epusdtMapToParams(params map[string]string) string {
	var tempArr []string
	for k, v := range params {
		if k == "signature" {
			continue
		}
		if v == "" {
			continue
		}
		tempArr = append(tempArr, k+"="+v)
	}
	sort.Strings(tempArr)
	out := ""
	for n, v := range tempArr {
		if n+1 < len(tempArr) {
			out = out + v + "&"
		} else {
			out = out + v
		}
	}
	return out
}

// epusdtSign mirrors epusdt's sign.Get: MD5(MapToParams(params) + secret),
// lowercase hex.
func epusdtSign(params map[string]string, secret string) string {
	digest := md5.Sum([]byte(epusdtMapToParams(params) + secret))
	return fmt.Sprintf("%x", digest)
}

// TestEpusdtPurchaseSignatureMatchesGoEpay proves the outbound purchase
// signature the go-epay client sends to epusdt's submit.php is the exact
// signature epusdt recomputes when it deletes sign/sign_type and re-signs the
// remaining fields.
func TestEpusdtPurchaseSignatureMatchesGoEpay(t *testing.T) {
	const (
		pid    = "1000"
		secret = "test_secret_key_abc123"
	)
	client, err := epay.NewClient(&epay.Config{PartnerID: pid, Key: secret},
		"https://pay.pawn.eu.org/payments/epay/v1/order/create-transaction")
	require.NoError(t, err)

	notifyURL, _ := url.Parse("https://newapi.example.com/api/user/epay/notify")
	returnURL, _ := url.Parse("https://newapi.example.com/console/log")

	_, params, err := client.Purchase(&epay.PurchaseArgs{
		Type:           "usdt",
		ServiceTradeNo: "USR1NOabcd1700000000",
		Name:           "TUC100",
		Money:          strconv.FormatFloat(100, 'f', 2, 64), // "100.00"
		Device:         epay.PC,
		NotifyUrl:      notifyURL,
		ReturnUrl:      returnURL,
	})
	require.NoError(t, err)

	goEpaySign := params["sign"]
	require.NotEmpty(t, goEpaySign)

	// epusdt deletes sign + sign_type before verifying, then re-signs the rest.
	verifyParams := make(map[string]string, len(params))
	for k, v := range params {
		if k == "sign" || k == "sign_type" {
			continue
		}
		verifyParams[k] = v
	}
	epusdtComputed := epusdtSign(verifyParams, secret)

	require.Equal(t, goEpaySign, epusdtComputed,
		"go-epay purchase sign must equal epusdt's recomputed sign")
}

// TestEpusdtCallbackSignatureVerifiesInGoEpay proves an epusdt-style callback
// (the exact fields worker.go sends: pid/trade_no/out_trade_no/type/name/money/
// trade_status, signed by epusdt) passes go-epay's client.Verify in new-api's
// EpayNotify handler.
func TestEpusdtCallbackSignatureVerifiesInGoEpay(t *testing.T) {
	const (
		pid    = "1000"
		secret = "test_secret_key_abc123"
	)

	// Fields epusdt's worker.go puts into the callback query (sign empty here).
	callback := map[string]string{
		"pid":          pid,
		"trade_no":     "epusdtTradeId001",
		"out_trade_no": "USR1NOabcd1700000000",
		"type":         "alipay",
		"name":         "TUC100",
		"money":        fmt.Sprintf("%.4f", 100.0), // "100.0000"
		"trade_status": epay.StatusTradeSuccess,
	}
	// epusdt signs with its own scheme:
	callback["sign"] = epusdtSign(callback, secret)
	callback["sign_type"] = "MD5"

	client, err := epay.NewClient(&epay.Config{PartnerID: pid, Key: secret},
		"https://pay.pawn.eu.org")
	require.NoError(t, err)

	verifyInfo, err := client.Verify(callback)
	require.NoError(t, err)
	require.True(t, verifyInfo.VerifyStatus, "go-epay must accept epusdt callback signature")
	require.Equal(t, epay.StatusTradeSuccess, verifyInfo.TradeStatus)
	require.Equal(t, "USR1NOabcd1700000000", verifyInfo.ServiceTradeNo)
}
