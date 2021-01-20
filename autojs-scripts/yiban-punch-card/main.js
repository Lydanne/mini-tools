toast("Start Yiban Script");

app.launchApp("易班");

while (!click("跳过"));

while (!click("易班校本化"));

while (!click("任务"));

while (!click("未反馈"));
sleep(300);

while (!className("android.widget.Button").findOne().click());
sleep(300);

setFormItemMany("家庭住址所在省/市/旗县", [6, 5, 1]);

setFormItemMany("目前所在省/市/旗县", [6, 5, 1]);

setFormItemText("今日体温", "36");

setFormItemBool("近期有无国（区）外出行史", false);

setFormItemBool("有无疫情严重地区接触史", false);

setFormItemBool("是否接触过疑似或确诊患者", false);

setFormItemBool("是否获悉学院疫情防控通知", true);

setFormItemBool("家人是否有确诊或疑似病例", false);

setFormItemText("本人联系方式", "15804854160");

swipe(500, 1500, 500, 1000, 500);
sleep(300);
setFormItemMultiText("其他说明", "无");

function setFormItemBool(label, val) {
  while (!click(label));
  sleep(500);
  selectWithOne(val ? 0 : 1);
  sleep(500);
  while (!click("确定"));
}

function setFormItemMany(label, selects) {
  while (!click(label));
  sleep(500);
  selectWithMany(selects);
  sleep(500);
  while (!click("确定"));
}

function setFormItemText(label, val) {
  formItemValue(label).setText(val);
}

function setFormItemMultiText(label, val) {
  const labelIndex = formItem(label).indexInParent();
  className("android.widget.EditText")
    .indexInParent(labelIndex + 1)
    .depth(8)
    .findOne()
    .setText(val);
}

function selectWithMany([c1, c2, c3]) {
  try {
    swipe(181, 2000, 181, 2000 - c1 * 93, c1 * 500); // 1442=2000-6*93, 3000=6*500
    sleep(100);
    swipe(554, 2000, 554, 2000 - c2 * 93, c2 * 500);
    sleep(100);
    swipe(954, 2000, 954, 2000 - c3 * 93, c3 * 500);
  } catch (e) {}
}

function selectWithOne(c1) {
  try {
    swipe(181, 2000, 181, 2000 - c1 * 93, c1 * 500); // 1442=2000-6*93, 3000=6*500
  } catch (e) {}
}

function formItem(label) {
  return className("android.widget.TextView").text(label).findOne().parent();
}

function formItemValue(label) {
  return className("android.widget.TextView")
    .text(label)
    .findOne()
    .parent()
    .parent()
    .children()[1]
    .children()[0];
}
