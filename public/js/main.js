$(function() {
  $('.do-gics').click(()=>{
    let input = $('.gics-program').val();
    $.ajax({
      url: '/gics',
      data: input,
      success: (output) => {
        $('.gics-svg').html(output.result);
        $('.gics-logs').html(output.logs.replace(/[\x00-\x08\x0E-\x1F]/g, '').replace(/\[\d+m/g,''));
      },
      method: 'POST',
      contentType: 'text/plain'
    });
  })
});