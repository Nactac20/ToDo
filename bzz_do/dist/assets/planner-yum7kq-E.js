import{f as u,g as E,a as k,t as D,b as x}from"./script-BY_DpysF.js";let i=new Date;i.setDate(1);function I(){y(),f(u(new Date)),document.getElementById("planner-prev-month")?.addEventListener("click",()=>{i.setMonth(i.getMonth()-1),y()}),document.getElementById("planner-next-month")?.addEventListener("click",()=>{i.setMonth(i.getMonth()+1),y()}),document.getElementById("task-detail-modal")?.addEventListener("click",e=>{e.target===e.currentTarget&&(e.currentTarget.style.display="none")}),document.querySelector("#task-detail-modal .close")?.addEventListener("click",()=>{document.getElementById("task-detail-modal").style.display="none"})}function y(){const e=document.getElementById("planner-calendar-grid"),a=document.getElementById("planner-month-year");if(!e||!a)return;const d=i.getFullYear(),t=i.getMonth(),n=["Январь","Февраль","Март","Апрель","Май","Июнь","Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь"];a.textContent=`${n[t]} ${d}`,e.innerHTML="",["Пн","Вт","Ср","Чт","Пт","Сб","Вс"].forEach(c=>{const s=document.createElement("div");s.className="week-day",s.textContent=c,e.appendChild(s)});const r=new Date(d,t,1).getDay()||7,b=new Date(d,t+1,0).getDate();for(let c=1;c<r;c++){const s=document.createElement("div");s.className="other-month",s.textContent=new Date(d,t,1-(r-c)).getDate(),e.appendChild(s)}const h=u(new Date);for(let c=1;c<=b;c++){const s=new Date(d,t,c),m=u(s),o=document.createElement("div");o.textContent=c,o.dataset.date=m,m===h&&o.classList.add("today"),E(m).length>0&&o.classList.add("has-tasks"),o.addEventListener("click",()=>{document.querySelectorAll(".planner-calendar-grid div").forEach(v=>v.classList.remove("active")),o.classList.add("active"),document.getElementById("planner-selected-day").textContent=k(s),f(m)}),e.appendChild(o)}const g=e.querySelector(`[data-date="${h}"]`);g&&(g.classList.add("active"),document.getElementById("planner-selected-day").textContent=`Сегодня, ${k(new Date)}`)}function f(e){const a=document.getElementById("planner-task-list"),d=document.querySelector(".task-list-placeholder");if(!a)return;const t=E(e);if(a.innerHTML="",t.length===0){d.style.display="block",a.style.display="none";return}d.style.display="none",a.style.display="block",t.forEach(n=>{const l=document.createElement("li");l.className=`task-item ${n.completed?"completed":""}`,l.dataset.id=n.id,l.innerHTML=`
            <label class="task-checkbox-wrapper">
                <input type="checkbox" ${n.completed?"checked":""}>
                <span class="task-title">${n.title}</span>
            </label>
            ${n.description?`<div class="task-desc">${n.description}</div>`:""}
        `,l.addEventListener("click",r=>{r.target.closest(".task-checkbox-wrapper")||L(n)});const p=l.querySelector('input[type="checkbox"]');p.addEventListener("change",()=>{D(n.id),l.classList.toggle("completed",p.checked)}),a.appendChild(l)})}function L(e){const a=document.getElementById("task-detail-modal"),d=a.querySelector("#task-detail-content");d.innerHTML=`
        <h4>${e.title}</h4>
        ${e.description?`<p><strong>Описание:</strong> ${e.description}</p>`:""}
        ${e.subtasks?.length?`
            <h5>Подзадачи:</h5>
            <ul>
                ${e.subtasks.map((t,n)=>`
                    <li>
                        <label>
                            <input type="checkbox" ${t.completed?"checked":""} data-task-id="${e.id}" data-idx="${n}">
                            ${t.text}
                        </label>
                    </li>
                `).join("")}
            </ul>
        `:""}
        <div class="modal-actions">
            <button class="btn-cancel" onclick="document.getElementById('task-detail-modal').style.display='none'">Закрыть</button>
        </div>
    `,d.addEventListener("change",t=>{if(t.target.matches('input[type="checkbox"]')){const n=Number(t.target.dataset.taskId),l=Number(t.target.dataset.idx);x(n,l)}}),a.style.display="flex"}export{I as init};
