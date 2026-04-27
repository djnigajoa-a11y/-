document.getElementById('paymentForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    alert('이니시스 PG 연동 준비중입니다. 실제 환경에서는 INIStdPay.pay() 호출');
    // INIStdPay.pay('SendPayForm_id');
});
