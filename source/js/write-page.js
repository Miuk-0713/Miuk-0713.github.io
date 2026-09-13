(function(){
var $=function(id){return document.getElementById(id)};
var elTitle=$('w-title'),elSlug=$('w-slug'),elCategory=$('w-category'),elTags=$('w-tags'),elExcerpt=$('w-excerpt'),elContent=$('w-content'),elToken=$('w-token'),elCharCount=$('w-charcount'),elDatetime=$('w-datetime');
var elTokenToggle=$('w-token-toggle'),elTokenBody=$('w-token-body'),elPreviewBtn=$('w-preview-btn'),elPreviewPanel=$('w-preview-panel'),elPreviewContent=$('w-preview-content'),elFmBtn=$('w-fm-btn'),elFmPreview=$('w-fm-preview'),elPublishBtn=$('w-publish-btn'),elToast=$('w-toast');
var elDropZone=$('w-drop-zone'),elFileInput=$('w-file-input'),elImportStatus=$('w-import-status');
var REPO='Miuk-0713/Miuk-0713.github.io',BRANCH='main',API='https://api.github.com/repos/'+REPO+'/contents/';
if(localStorage.getItem('gh_pat')){elToken.value=localStorage.getItem('gh_pat')}
function updateDatetime(){var now=new Date();var y=now.getFullYear(),m=String(now.getMonth()+1).padStart(2,'0'),d=String(now.getDate()).padStart(2,'0'),h=String(now.getHours()).padStart(2,'0'),min=String(now.getMinutes()).padStart(2,'0'),s=String(now.getSeconds()).padStart(2,'0');elDatetime.textContent=y+'-'+m+'-'+d+' '+h+':'+min+':'+s}
function updateCharCount(){var text=elContent.value;var count=text.replace(/\s/g,'').length;elCharCount.textContent='共 '+count+' 字'}
setInterval(updateDatetime,1000);updateDatetime();
elContent.addEventListener('input',updateCharCount);
elTitle.addEventListener('input',function(){if(!elSlug.dataset.manual){elSlug.value=elTitle.value.toLowerCase().replace(/[^\w\u4e00-\u9fff\s-]/g,'').replace(/\s+/g,'-').replace(/-+/g,'-').replace(/^-|-$/g,'')}});
elSlug.addEventListener('input',function(){elSlug.dataset.manual='1'});
elTokenToggle.addEventListener('click',function(){var isOpen=elTokenBody.classList.toggle('open');elTokenToggle.classList.toggle('open',isOpen)});
function buildFrontMatter(){var title=elTitle.value.trim()||'Untitled';var category=elCategory.value.trim();var tagsStr=elTags.value.trim();var excerpt=elExcerpt.value.trim();var now=new Date();var dateStr=now.getFullYear()+'-'+String(now.getMonth()+1).padStart(2,'0')+'-'+String(now.getDate()).padStart(2,'0')+' '+String(now.getHours()).padStart(2,'0')+':'+String(now.getMinutes()).padStart(2,'0')+':'+String(now.getSeconds()).padStart(2,'0');var lines=[];lines.push('---');lines.push('title: '+title);lines.push('date: '+dateStr);lines.push('updated: '+dateStr);if(tagsStr){lines.push('tags:');tagsStr.split(',').forEach(function(t){t=t.trim();if(t)lines.push('  - '+t)})}if(category){lines.push('categories:');lines.push('  - '+category)}lines.push('index_img: /img/posts/default-cover.png');lines.push('math: false');lines.push('comments: true');if(excerpt){lines.push('excerpt: '+excerpt)}lines.push('---');return lines.join('\n')}
function buildFullMarkdown(){return buildFrontMatter()+'\n\n'+elContent.value}
elPreviewBtn.addEventListener('click',function(){var isActive=elPreviewPanel.classList.toggle('active');if(isActive){var mdText=elContent.value||'*暂无内容*';elPreviewContent.innerHTML=marked.parse(mdText);try{renderMathInElement(elPreviewContent,{delimiters:[{left:'$$',right:'$$',display:true},{left:'$',right:'$',display:false},{left:'\\(',right:'\\)',display:false},{left:'\\[',right:'\\]',display:true}],throwOnError:false})}catch(e){}elPreviewBtn.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg> 关闭预览'}else{elPreviewBtn.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg> 实时预览'}});
elFmBtn.addEventListener('click',function(){var isActive=elFmPreview.classList.toggle('active');if(isActive){elFmPreview.textContent=buildFullMarkdown();elFmBtn.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 18 22 2 8 2 8 18"/><path d="M2 22h14v-4H2z"/></svg> 隐藏 Front-matter'}else{elFmBtn.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 18 22 2 8 2 8 18"/><path d="M2 22h14v-4H2z"/></svg> 查看 Front-matter'}});
function showToast(msg,type,duration){type=type||'info';duration=duration||4000;elToast.textContent=msg;elToast.className='write-toast '+type;setTimeout(function(){elToast.classList.add('show')},10);setTimeout(function(){elToast.classList.remove('show')},duration)}
elPublishBtn.addEventListener('click',function(){var token=elToken.value.trim();if(!token){showToast('请先在「GitHub 发布配置」中填写 Personal Access Token','error',5000);elTokenBody.classList.add('open');elTokenToggle.classList.add('open');elToken.focus();return}var slug=elSlug.value.trim();if(!slug){showToast('请填写英文文件名','error');elSlug.focus();return}var title=elTitle.value.trim();if(!title){showToast('请填写文章标题','error');elTitle.focus();return}localStorage.setItem('gh_pat',token);var fullMd=buildFullMarkdown();var filePath='source/_posts/'+slug+'.md';var url=API+encodeURIComponent(filePath);var body=JSON.stringify({message:'post: '+title,content:btoa(unescape(encodeURIComponent(fullMd))),branch:BRANCH});elPublishBtn.disabled=true;elPublishBtn.innerHTML='<span class="write-spinner"></span> 发布中...';fetch(url,{method:'PUT',headers:{'Authorization':'token '+token,'Content-Type':'application/json','Accept':'application/vnd.github.v3+json'},body:body}).then(function(res){return res.json().then(function(data){return{status:res.status,data:data}})}).then(function(result){elPublishBtn.disabled=false;elPublishBtn.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/></svg> 一键发布到 GitHub';if(result.status===201){showToast('发布成功！GitHub Actions 正在自动化构建，约 1 分钟后全网上线。','success',8000)}else if(result.status===422){showToast('文件已存在，请更换文件名或删除远程文件后重试。','error',6000)}else{var errMsg=(result.data&&result.data.message)||'未知错误';showToast('发布失败：'+errMsg,'error',6000)}}).catch(function(err){elPublishBtn.disabled=false;elPublishBtn.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/></svg> 一键发布到 GitHub';showToast('网络错误：'+err.message,'error',6000)})});
elContent.addEventListener('keydown',function(e){if(e.key==='Tab'){e.preventDefault();var start=this.selectionStart,end=this.selectionEnd;this.value=this.value.substring(0,start)+'  '+this.value.substring(end);this.selectionStart=this.selectionEnd=start+2}});

function htmlToMarkdown(html){
var div=document.createElement('div');div.innerHTML=html;
var result='';
function walk(node,depth){
if(node.nodeType===3){var txt=node.textContent;if(txt.trim())result+=txt;return}
if(node.nodeType!==1)return;
var tag=node.tagName.toLowerCase();
if(tag==='h1'){result+='\n# ';walkChildren(node,depth);result+='\n\n'}
else if(tag==='h2'){result+='\n## ';walkChildren(node,depth);result+='\n\n'}
else if(tag==='h3'){result+='\n### ';walkChildren(node,depth);result+='\n\n'}
else if(tag==='h4'){result+='\n#### ';walkChildren(node,depth);result+='\n\n'}
else if(tag==='p'){result+='\n';walkChildren(node,depth);result+='\n\n'}
else if(tag==='strong'||tag==='b'){result+='**';walkChildren(node,depth);result+='**'}
else if(tag==='em'||tag==='i'){result+='*';walkChildren(node,depth);result+='*'}
else if(tag==='code'){if(node.parentElement&&node.parentElement.tagName.toLowerCase()==='pre'){result+=node.textContent}else{result+='`'+node.textContent+'`'}}
else if(tag==='pre'){result+='\n```\n'+node.textContent+'\n```\n\n'}
else if(tag==='blockquote'){result+='\n> ';walkChildren(node,depth);result+='\n\n'}
else if(tag==='ul'||tag==='ol'){result+='\n';for(var i=0;i<node.children.length;i++){if(tag==='ol')result+=(i+1)+'. ';else result+='- ';walkChildren(node.children[i],depth);result+='\n'}result+='\n'}
else if(tag==='li'){walkChildren(node,depth)}
else if(tag==='a'){result+='[';walkChildren(node,depth);result+=']('+node.getAttribute('href')+')'}
else if(tag==='img'){result+='!['+(node.getAttribute('alt')||'')+']('+(node.getAttribute('src')||'')+')'}
else if(tag==='br'){result+='\n'}
else if(tag==='table'){var rows=node.querySelectorAll('tr');result+='\n';rows.forEach(function(tr,idx){var cells=tr.querySelectorAll('th,td');cells.forEach(function(c,i){result+='| '+c.textContent.trim()+' ';if(i===cells.length-1)result+='|'});result+='\n';if(idx===0){cells.forEach(function(c,i){result+='| --- ';if(i===cells.length-1)result+='|'});result+='\n'}});result+='\n'}
else{walkChildren(node,depth)}
}
function walkChildren(node,depth){for(var i=0;i<node.childNodes.length;i++)walk(node.childNodes[i],depth)}
walkChildren(div,0);
return result.replace(/\n{3,}/g,'\n\n').trim();
}

function handleImportedFile(file){
var name=file.name;var ext=name.split('.').pop().toLowerCase();
var importStatus=elImportStatus;
if(ext==='docx'){
var reader=new FileReader();
reader.onload=function(e){
if(typeof mammoth==='undefined'){showToast('mammoth.js 库未加载，请检查网络连接','error');return}
mammoth.convertToMarkdown({arrayBuffer:e.target.result}).then(function(result){
var md=result.value;
elContent.value=md;
if(!elTitle.value.trim()){var firstLine=md.split('\n')[0].replace(/^#+\s*/,'').trim();if(firstLine)elTitle.value=firstLine}
updateCharCount();
importStatus.textContent='✓ Word 文档已导入：'+name;
importStatus.className='write-import-status show';
showToast('Word 文档解析成功，已填充到编辑器','success');
}).catch(function(err){
importStatus.textContent='✗ 解析失败：'+err.message;
importStatus.className='write-import-status show error';
showToast('Word 文档解析失败','error');
});
};
reader.readAsArrayBuffer(file);
}else if(ext==='md'||ext==='markdown'||ext==='txt'){
var reader=new FileReader();
reader.onload=function(e){
var text=e.target.result;
elContent.value=text;
if(!elTitle.value.trim()){var firstLine=text.split('\n')[0].replace(/^#+\s*/,'').replace(/^---/,'').trim();if(firstLine)elTitle.value=firstLine}
updateCharCount();
importStatus.textContent='✓ 文件已导入：'+name;
importStatus.className='write-import-status show';
showToast('文件导入成功','success');
};
reader.readAsText(file);
}else{
showToast('不支持的文件格式，请上传 .docx / .md / .txt','error');
}
}

if(elDropZone&&elFileInput){
elDropZone.addEventListener('click',function(){elFileInput.click()});
elFileInput.addEventListener('change',function(){if(this.files&&this.files[0])handleImportedFile(this.files[0]);this.value=''});
elDropZone.addEventListener('dragover',function(e){e.preventDefault();e.stopPropagation();elDropZone.classList.add('dragover')});
elDropZone.addEventListener('dragleave',function(e){e.preventDefault();e.stopPropagation();elDropZone.classList.remove('dragover')});
elDropZone.addEventListener('drop',function(e){e.preventDefault();e.stopPropagation();elDropZone.classList.remove('dragover');if(e.dataTransfer.files&&e.dataTransfer.files[0])handleImportedFile(e.dataTransfer.files[0])});
}
})();