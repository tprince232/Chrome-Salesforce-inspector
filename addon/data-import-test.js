/* eslint-disable no-unused-vars */
/* global sfConn apiVersion async */
/* exported dataImportTest */
/* eslint-enable no-unused-vars */
"use strict";
function* dataImportTest(test) {
  console.log("TEST dataImportVm");
  let {sfHost, assertEquals, assertNotEquals, assert, loadPage, anonApex} = test;
  let {testData: {vm}} = yield loadPage("data-import.html");

  function waitForSpinner() {
    return new Promise(resolve => {
      let subs = vm.spinnerCount.subscribe(count => {
        if (count == 0) {
          subs.dispose();
          resolve();
        }
      });
    });
  }

  function getRecords(result) {
    for (let record of result.records) {
      record.attributes = undefined;
      if (record.Lookup__r) {
        record.Lookup__r.attributes = undefined;
      }
    }
    return result.records;
  }

  vm.importType("Inspector_Test__c");
  vm.importAction("update");

  /* eslint-disable camelcase */ // sObject field names
  yield waitForSpinner();

  // Autocomplete lists
  assert(vm.sobjectList().indexOf("Inspector_Test__c") > -1);
  assertEquals(["Id", "Name"], vm.idLookupList());
  assertEquals(["Id", "OwnerId", "Owner:Group:Id", "Owner:Group:Name", "Owner:User:Id", "Owner:User:Username", "Owner:User:Email", "Owner:User:FederationIdentifier", "Name", "Checkbox__c", "Number__c", "Lookup__c", "Lookup__r:Inspector_Test__c:Id", "Lookup__r:Inspector_Test__c:Name", "__Status", "__Id", "__Action", "__Errors"], vm.columnList());

  // See user info
  assert(vm.userInfo().indexOf(" / ") > -1);

  // Set up test records
  yield* anonApex(`
    delete [select Id from Inspector_Test__c];
    insert new Inspector_Test__c(Name = 'test1', Checkbox__c = false, Number__c = 100.01);
    insert new Inspector_Test__c(Name = 'test2', Checkbox__c = true, Number__c = 200.02);
  `);
  let records;

  // Create csv
  vm.dataFormat("csv");
  vm.importAction("create");
  assertEquals(null, vm.confirmPopup());
  assertEquals(0, vm.activeBatches());
  assertEquals({Queued: 0, Processing: 0, Succeeded: 0, Failed: 0}, vm.importCounts());
  assertEquals(null, vm.importTableResult());
  vm.setData('"Name","Checkbox__c","Number__c","Lookup__r:Inspector_Test__c:Name"\r\n"test3","false","300.03",""\r\ntest4,false,400.04,test1\r\ntest5,true,500.05,\r\n"test6","true","600.06","notfound"');
  assertEquals({Queued: 4, Processing: 0, Succeeded: 0, Failed: 0}, vm.importCounts());
  assertEquals({
    table: [["Name", "Checkbox__c", "Number__c", "Lookup__r:Inspector_Test__c:Name"], ["test3", "false", "300.03", ""], ["test4", "false", "400.04", "test1"], ["test5", "true", "500.05", ""], ["test6", "true", "600.06", "notfound"]],
    isTooling: false,
    describeInfo: {},
    sfHost,
    rowVisibilities: [true, true, true, true, true],
    colVisibilities: [true, true, true, true]}, vm.importTableResult());
  vm.doImport();
  assertEquals({text: "4 records will be imported.", action: undefined}, vm.confirmPopup());
  assertEquals(0, vm.activeBatches());
  assertEquals({Queued: 4, Processing: 0, Succeeded: 0, Failed: 0}, vm.importCounts());
  assertEquals({
    table: [["Name", "Checkbox__c", "Number__c", "Lookup__r:Inspector_Test__c:Name"], ["test3", "false", "300.03", ""], ["test4", "false", "400.04", "test1"], ["test5", "true", "500.05", ""], ["test6", "true", "600.06", "notfound"]],
    isTooling: false,
    describeInfo: {},
    sfHost,
    rowVisibilities: [true, true, true, true, true],
    colVisibilities: [true, true, true, true]}, vm.importTableResult());
  vm.confirmPopupNo();
  assertEquals(null, vm.confirmPopup());
  assertEquals(0, vm.activeBatches());
  assertEquals({Queued: 4, Processing: 0, Succeeded: 0, Failed: 0}, vm.importCounts());
  assertEquals({
    table: [["Name", "Checkbox__c", "Number__c", "Lookup__r:Inspector_Test__c:Name"], ["test3", "false", "300.03", ""], ["test4", "false", "400.04", "test1"], ["test5", "true", "500.05", ""], ["test6", "true", "600.06", "notfound"]],
    isTooling: false,
    describeInfo: {},
    sfHost,
    rowVisibilities: [true, true, true, true, true],
    colVisibilities: [true, true, true, true]}, vm.importTableResult());
  vm.doImport();
  assertEquals({text: "4 records will be imported.", action: undefined}, vm.confirmPopup());
  assertEquals(0, vm.activeBatches());
  assertEquals({Queued: 4, Processing: 0, Succeeded: 0, Failed: 0}, vm.importCounts());
  assertEquals({
    table: [["Name", "Checkbox__c", "Number__c", "Lookup__r:Inspector_Test__c:Name"], ["test3", "false", "300.03", ""], ["test4", "false", "400.04", "test1"], ["test5", "true", "500.05", ""], ["test6", "true", "600.06", "notfound"]],
    isTooling: false,
    describeInfo: {},
    sfHost,
    rowVisibilities: [true, true, true, true, true],
    colVisibilities: [true, true, true, true]}, vm.importTableResult());
  vm.confirmPopupYes();
  assertEquals(null, vm.confirmPopup());
  assertEquals(1, vm.activeBatches());
  assertEquals({Queued: 0, Processing: 4, Succeeded: 0, Failed: 0}, vm.importCounts());
  assertEquals({
    table: [["Name", "Checkbox__c", "Number__c", "Lookup__r:Inspector_Test__c:Name", "__Status", "__Id", "__Action", "__Errors"], ["test3", "false", "300.03", "", "Processing", "", "", ""], ["test4", "false", "400.04", "test1", "Processing", "", "", ""], ["test5", "true", "500.05", "", "Processing", "", "", ""], ["test6", "true", "600.06", "notfound", "Processing", "", "", ""]],
    isTooling: false,
    describeInfo: {},
    sfHost,
    rowVisibilities: [true, true, true, true, true],
    colVisibilities: [true, true, true, true, true, true, true, true]}, vm.importTableResult());
  yield waitForSpinner();
  assertEquals(null, vm.confirmPopup());
  assertEquals(0, vm.activeBatches());
  assertEquals({Queued: 0, Processing: 0, Succeeded: 3, Failed: 1}, vm.importCounts());
  assertEquals([["Name", "Checkbox__c", "Number__c", "Lookup__r:Inspector_Test__c:Name", "__Status", "__Id", "__Action", "__Errors"], ["test3", "false", "300.03", "", "Succeeded", "--id--", "Inserted", ""], ["test4", "false", "400.04", "test1", "Succeeded", "--id--", "Inserted", ""], ["test5", "true", "500.05", "", "Succeeded", "--id--", "Inserted", ""], ["test6", "true", "600.06", "notfound", "Failed", "", "", "INVALID_FIELD: Foreign key external ID: notfound not found for field Name in entity Inspector_Test__c []"]], vm.importTableResult().table.map(row => row.map(cell => /^[a-zA-Z0-9]{18}$/.test(cell) ? "--id--" : cell)));
  records = getRecords(yield sfConn.rest("/services/data/v35.0/query/?q=" + encodeURIComponent("select Name, Checkbox__c, Number__c, Lookup__r.Name from Inspector_Test__c order by Name")));
  assertEquals([
    {Name: "test1", Checkbox__c: false, Number__c: 100.01, Lookup__r: null},
    {Name: "test2", Checkbox__c: true, Number__c: 200.02, Lookup__r: null},
    {Name: "test3", Checkbox__c: false, Number__c: 300.03, Lookup__r: null},
    {Name: "test4", Checkbox__c: false, Number__c: 400.04, Lookup__r: {Name: "test1"}},
    {Name: "test5", Checkbox__c: true, Number__c: 500.05, Lookup__r: null}
  ], records);

  // Create excel
  vm.dataFormat("excel");
  vm.importAction("create");
  vm.setData('"Name"\t"Number__c"\r\ntest6\t600.06\r\n"test7"\t"700.07"\r\n');
  vm.doImport();
  assertEquals({text: "2 records will be imported.", action: undefined}, vm.confirmPopup());
  vm.confirmPopupYes();
  assertEquals(null, vm.confirmPopup());
  assertEquals({Queued: 0, Processing: 2, Succeeded: 0, Failed: 0}, vm.importCounts());
  assertEquals([["Name", "Number__c", "__Status", "__Id", "__Action", "__Errors"], ["test6", "600.06", "Processing", "", "", ""], ["test7", "700.07", "Processing", "", "", ""]], vm.importTableResult().table);
  yield waitForSpinner();
  assertEquals({Queued: 0, Processing: 0, Succeeded: 2, Failed: 0}, vm.importCounts());
  assertEquals([["Name", "Number__c", "__Status", "__Id", "__Action", "__Errors"], ["test6", "600.06", "Succeeded", "--id--", "Inserted", ""], ["test7", "700.07", "Succeeded", "--id--", "Inserted", ""]], vm.importTableResult().table.map(row => row.map(cell => /^[a-zA-Z0-9]{18}$/.test(cell) ? "--id--" : cell)));
  records = getRecords(yield sfConn.rest("/services/data/v35.0/query/?q=" + encodeURIComponent("select Name, Checkbox__c, Number__c, Lookup__r.Name from Inspector_Test__c order by Name")));
  assertEquals([
    {Name: "test1", Checkbox__c: false, Number__c: 100.01, Lookup__r: null},
    {Name: "test2", Checkbox__c: true, Number__c: 200.02, Lookup__r: null},
    {Name: "test3", Checkbox__c: false, Number__c: 300.03, Lookup__r: null},
    {Name: "test4", Checkbox__c: false, Number__c: 400.04, Lookup__r: {Name: "test1"}},
    {Name: "test5", Checkbox__c: true, Number__c: 500.05, Lookup__r: null},
    {Name: "test6", Checkbox__c: false, Number__c: 600.06, Lookup__r: null},
    {Name: "test7", Checkbox__c: false, Number__c: 700.07, Lookup__r: null}
  ], records);

  // Update csv
  records = getRecords(yield sfConn.rest("/services/data/v35.0/query/?q=" + encodeURIComponent("select Id from Inspector_Test__c order by Name")));
  vm.dataFormat("csv");
  vm.importAction("update");
  vm.setData("Id,Name,Number__c\r\n" + records[4].Id + ",test5update,500.50\r\n" + records[5].Id + ",test6update,600.60\r\n");
  vm.doImport();
  assertEquals({text: "2 records will be imported.", action: undefined}, vm.confirmPopup());
  vm.confirmPopupYes();
  assertEquals([["Id", "Name", "Number__c", "__Status", "__Id", "__Action", "__Errors"], [records[4].Id, "test5update", "500.50", "Processing", "", "", ""], [records[5].Id, "test6update", "600.60", "Processing", "", "", ""]], vm.importTableResult().table);
  yield waitForSpinner();
  assertEquals({Queued: 0, Processing: 0, Succeeded: 2, Failed: 0}, vm.importCounts());
  assertEquals([["Id", "Name", "Number__c", "__Status", "__Id", "__Action", "__Errors"], [records[4].Id, "test5update", "500.50", "Succeeded", records[4].Id, "Updated", ""], [records[5].Id, "test6update", "600.60", "Succeeded", records[5].Id, "Updated", ""]], vm.importTableResult().table);
  records = getRecords(yield sfConn.rest("/services/data/v35.0/query/?q=" + encodeURIComponent("select Name, Checkbox__c, Number__c, Lookup__r.Name from Inspector_Test__c order by Name")));
  assertEquals([
    {Name: "test1", Checkbox__c: false, Number__c: 100.01, Lookup__r: null},
    {Name: "test2", Checkbox__c: true, Number__c: 200.02, Lookup__r: null},
    {Name: "test3", Checkbox__c: false, Number__c: 300.03, Lookup__r: null},
    {Name: "test4", Checkbox__c: false, Number__c: 400.04, Lookup__r: {Name: "test1"}},
    {Name: "test5update", Checkbox__c: true, Number__c: 500.50, Lookup__r: null},
    {Name: "test6update", Checkbox__c: false, Number__c: 600.60, Lookup__r: null},
    {Name: "test7", Checkbox__c: false, Number__c: 700.07, Lookup__r: null}
  ], records);

  // Delete csv (with ignored column and status column)
  records = getRecords(yield sfConn.rest("/services/data/v35.0/query/?q=" + encodeURIComponent("select Id from Inspector_Test__c order by Name")));
  vm.dataFormat("csv");
  vm.importAction("delete");
  vm.setData("Id,_foo*,__Status\r\n" + records[5].Id + ",foo,Queued\r\n" + records[6].Id + ",foo,Succeeded");
  assertEquals({Queued: 1, Processing: 0, Succeeded: 1, Failed: 0}, vm.importCounts());
  vm.doImport();
  assertEquals({text: "1 records will be imported. 1 records will be skipped because they have __Status Succeeded or Failed.", action: undefined}, vm.confirmPopup());
  vm.confirmPopupYes();
  assertEquals({Queued: 0, Processing: 1, Succeeded: 1, Failed: 0}, vm.importCounts());
  assertEquals([["Id", "_foo*", "__Status", "__Id", "__Action", "__Errors"], [records[5].Id, "foo", "Processing", "", "", ""], [records[6].Id, "foo", "Succeeded", "", "", ""]], vm.importTableResult().table);
  yield waitForSpinner();
  assertEquals({Queued: 0, Processing: 0, Succeeded: 2, Failed: 0}, vm.importCounts());
  assertEquals([["Id", "_foo*", "__Status", "__Id", "__Action", "__Errors"], [records[5].Id, "foo", "Succeeded", records[5].Id, "Deleted", ""], [records[6].Id, "foo", "Succeeded", "", "", ""]], vm.importTableResult().table);
  records = getRecords(yield sfConn.rest("/services/data/v35.0/query/?q=" + encodeURIComponent("select Name, Checkbox__c, Number__c, Lookup__r.Name from Inspector_Test__c order by Name")));
  assertEquals([
    {Name: "test1", Checkbox__c: false, Number__c: 100.01, Lookup__r: null},
    {Name: "test2", Checkbox__c: true, Number__c: 200.02, Lookup__r: null},
    {Name: "test3", Checkbox__c: false, Number__c: 300.03, Lookup__r: null},
    {Name: "test4", Checkbox__c: false, Number__c: 400.04, Lookup__r: {Name: "test1"}},
    {Name: "test5update", Checkbox__c: true, Number__c: 500.50, Lookup__r: null},
    {Name: "test7", Checkbox__c: false, Number__c: 700.07, Lookup__r: null}
  ], records);

  // Upsert csv
  vm.dataFormat("csv");
  vm.importAction("upsert");
  vm.externalId("Name");
  vm.setData("Name,Number__c\r\ntest2,222\r\ntest6,666\r\n");
  vm.doImport();
  assertEquals({text: "2 records will be imported.", action: undefined}, vm.confirmPopup());
  vm.confirmPopupYes();
  assertEquals([["Name", "Number__c", "__Status", "__Id", "__Action", "__Errors"], ["test2", "222", "Processing", "", "", ""], ["test6", "666", "Processing", "", "", ""]], vm.importTableResult().table);
  yield waitForSpinner();
  assertEquals({Queued: 0, Processing: 0, Succeeded: 2, Failed: 0}, vm.importCounts());
  assertEquals([["Name", "Number__c", "__Status", "__Id", "__Action", "__Errors"], ["test2", "222", "Succeeded", "--id--", "Updated", ""], ["test6", "666", "Succeeded", "--id--", "Inserted", ""]], vm.importTableResult().table.map(row => row.map(cell => /^[a-zA-Z0-9]{18}$/.test(cell) ? "--id--" : cell)));
  records = getRecords(yield sfConn.rest("/services/data/v35.0/query/?q=" + encodeURIComponent("select Name, Checkbox__c, Number__c, Lookup__r.Name from Inspector_Test__c order by Name")));
  assertEquals([
    {Name: "test1", Checkbox__c: false, Number__c: 100.01, Lookup__r: null},
    {Name: "test2", Checkbox__c: true, Number__c: 222, Lookup__r: null},
    {Name: "test3", Checkbox__c: false, Number__c: 300.03, Lookup__r: null},
    {Name: "test4", Checkbox__c: false, Number__c: 400.04, Lookup__r: {Name: "test1"}},
    {Name: "test5update", Checkbox__c: true, Number__c: 500.50, Lookup__r: null},
    {Name: "test6", Checkbox__c: false, Number__c: 666, Lookup__r: null},
    {Name: "test7", Checkbox__c: false, Number__c: 700.07, Lookup__r: null}
  ], records);

  // Create multiple batches
  yield* anonApex("delete [select Id from Inspector_Test__c];");
  vm.dataFormat("csv");
  vm.importAction("create");
  vm.batchSize("3");
  vm.batchConcurrency("2");
  vm.setData("Name\r\ntest10\r\ntest11\r\ntest12\r\ntest13\r\ntest14\r\ntest15\r\ntest16\r\ntest17\r\ntest18\r\ntest19\r\ntest20\r\ntest21\r\ntest22\r\ntest23\r\ntest24\r\ntest25");
  vm.doImport();
  assertEquals({text: "16 records will be imported.", action: undefined}, vm.confirmPopup());
  vm.confirmPopupYes();
  assertEquals(null, vm.confirmPopup());
  assertEquals({Queued: 13, Processing: 3, Succeeded: 0, Failed: 0}, vm.importCounts());
  assertEquals([["Name", "__Status", "__Id", "__Action", "__Errors"], ["test10", "Processing", "", "", ""], ["test11", "Processing", "", "", ""], ["test12", "Processing", "", "", ""], ["test13", "Queued", "", "", ""], ["test14", "Queued", "", "", ""], ["test15", "Queued", "", "", ""], ["test16", "Queued", "", "", ""], ["test17", "Queued", "", "", ""], ["test18", "Queued", "", "", ""], ["test19", "Queued", "", "", ""], ["test20", "Queued", "", "", ""], ["test21", "Queued", "", "", ""], ["test22", "Queued", "", "", ""], ["test23", "Queued", "", "", ""], ["test24", "Queued", "", "", ""], ["test25", "Queued", "", "", ""]], vm.importTableResult().table);
  yield waitForSpinner();
  assertEquals({Queued: 0, Processing: 0, Succeeded: 16, Failed: 0}, vm.importCounts());
  assertEquals([["Name", "__Status", "__Id", "__Action", "__Errors"], ["test10", "Succeeded", "--id--", "Inserted", ""], ["test11", "Succeeded", "--id--", "Inserted", ""], ["test12", "Succeeded", "--id--", "Inserted", ""], ["test13", "Succeeded", "--id--", "Inserted", ""], ["test14", "Succeeded", "--id--", "Inserted", ""], ["test15", "Succeeded", "--id--", "Inserted", ""], ["test16", "Succeeded", "--id--", "Inserted", ""], ["test17", "Succeeded", "--id--", "Inserted", ""], ["test18", "Succeeded", "--id--", "Inserted", ""], ["test19", "Succeeded", "--id--", "Inserted", ""], ["test20", "Succeeded", "--id--", "Inserted", ""], ["test21", "Succeeded", "--id--", "Inserted", ""], ["test22", "Succeeded", "--id--", "Inserted", ""], ["test23", "Succeeded", "--id--", "Inserted", ""], ["test24", "Succeeded", "--id--", "Inserted", ""], ["test25", "Succeeded", "--id--", "Inserted", ""]], vm.importTableResult().table.map(row => row.map(cell => /^[a-zA-Z0-9]{18}$/.test(cell) ? "--id--" : cell)));
  records = getRecords(yield sfConn.rest("/services/data/v35.0/query/?q=" + encodeURIComponent("select Name from Inspector_Test__c order by Name")));
  assertEquals([
    {Name: "test10"}, {Name: "test11"}, {Name: "test12"}, {Name: "test13"}, {Name: "test14"}, {Name: "test15"}, {Name: "test16"}, {Name: "test17"}, {Name: "test18"}, {Name: "test19"}, {Name: "test20"}, {Name: "test21"}, {Name: "test22"}, {Name: "test23"}, {Name: "test24"}, {Name: "test25"}
  ], records);

  // Stop import
  yield* anonApex("delete [select Id from Inspector_Test__c];");
  vm.dataFormat("csv");
  vm.importAction("create");
  vm.batchSize("3");
  vm.batchConcurrency("2");
  vm.setData("Name\r\ntest10\r\ntest11\r\ntest12\r\ntest13\r\ntest14\r\ntest15\r\ntest16\r\ntest17\r\ntest18\r\ntest19\r\ntest20\r\ntest21\r\ntest22\r\ntest23\r\ntest24\r\ntest25");
  vm.doImport();
  assertEquals({text: "16 records will be imported.", action: undefined}, vm.confirmPopup());
  vm.confirmPopupYes();
  assertEquals(null, vm.confirmPopup());
  assertNotEquals(0, vm.activeBatches());
  assertEquals({Queued: 13, Processing: 3, Succeeded: 0, Failed: 0}, vm.importCounts());
  assertEquals([["Name", "__Status", "__Id", "__Action", "__Errors"], ["test10", "Processing", "", "", ""], ["test11", "Processing", "", "", ""], ["test12", "Processing", "", "", ""], ["test13", "Queued", "", "", ""], ["test14", "Queued", "", "", ""], ["test15", "Queued", "", "", ""], ["test16", "Queued", "", "", ""], ["test17", "Queued", "", "", ""], ["test18", "Queued", "", "", ""], ["test19", "Queued", "", "", ""], ["test20", "Queued", "", "", ""], ["test21", "Queued", "", "", ""], ["test22", "Queued", "", "", ""], ["test23", "Queued", "", "", ""], ["test24", "Queued", "", "", ""], ["test25", "Queued", "", "", ""]], vm.importTableResult().table);
  vm.toggleProcessing();
  assertNotEquals(0, vm.activeBatches());
  assertEquals({Queued: 13, Processing: 3, Succeeded: 0, Failed: 0}, vm.importCounts());
  assertEquals([["Name", "__Status", "__Id", "__Action", "__Errors"], ["test10", "Processing", "", "", ""], ["test11", "Processing", "", "", ""], ["test12", "Processing", "", "", ""], ["test13", "Queued", "", "", ""], ["test14", "Queued", "", "", ""], ["test15", "Queued", "", "", ""], ["test16", "Queued", "", "", ""], ["test17", "Queued", "", "", ""], ["test18", "Queued", "", "", ""], ["test19", "Queued", "", "", ""], ["test20", "Queued", "", "", ""], ["test21", "Queued", "", "", ""], ["test22", "Queued", "", "", ""], ["test23", "Queued", "", "", ""], ["test24", "Queued", "", "", ""], ["test25", "Queued", "", "", ""]], vm.importTableResult().table);
  yield waitForSpinner();
  assertEquals(0, vm.activeBatches());
  assertEquals({Queued: 13, Processing: 0, Succeeded: 3, Failed: 0}, vm.importCounts());
  assertEquals([["Name", "__Status", "__Id", "__Action", "__Errors"], ["test10", "Succeeded", "--id--", "Inserted", ""], ["test11", "Succeeded", "--id--", "Inserted", ""], ["test12", "Succeeded", "--id--", "Inserted", ""], ["test13", "Queued", "", "", ""], ["test14", "Queued", "", "", ""], ["test15", "Queued", "", "", ""], ["test16", "Queued", "", "", ""], ["test17", "Queued", "", "", ""], ["test18", "Queued", "", "", ""], ["test19", "Queued", "", "", ""], ["test20", "Queued", "", "", ""], ["test21", "Queued", "", "", ""], ["test22", "Queued", "", "", ""], ["test23", "Queued", "", "", ""], ["test24", "Queued", "", "", ""], ["test25", "Queued", "", "", ""]], vm.importTableResult().table.map(row => row.map(cell => /^[a-zA-Z0-9]{18}$/.test(cell) ? "--id--" : cell)));
  records = getRecords(yield sfConn.rest("/services/data/v35.0/query/?q=" + encodeURIComponent("select Name from Inspector_Test__c order by Name")));
  assertEquals([
    {Name: "test10"}, {Name: "test11"}, {Name: "test12"}
  ], records);

  // Errors (local validations)
  vm.dataFormat("csv");
  vm.importAction("create");
  vm.setData("");
  assertEquals(true, vm.invalidInput());
  assertEquals("Error: no data", vm.dataError());
  assertEquals({Queued: 0, Processing: 0, Succeeded: 0, Failed: 0}, vm.importCounts());

  vm.setData('"foo","bar"\r\n"baz","unclosed quote');
  assertEquals(true, vm.invalidInput());
  assertEquals("Error: Quote not closed", vm.dataError());
  assertEquals({Queued: 0, Processing: 0, Succeeded: 0, Failed: 0}, vm.importCounts());

  vm.setData('"foo","bar"\r\n"foo","bar"text after quote');
  assertEquals(true, vm.invalidInput());
  assertEquals("Error: unexpected token 't'", vm.dataError());
  assertEquals({Queued: 0, Processing: 0, Succeeded: 0, Failed: 0}, vm.importCounts());

  vm.setData("a,b\r\nc,d\r\ne");
  assertEquals(true, vm.invalidInput());
  assertEquals("Error: row 3 has 1 cells, expected 2", vm.dataError());
  assertEquals({Queued: 0, Processing: 0, Succeeded: 0, Failed: 0}, vm.importCounts());

  vm.setData("Name");
  assertEquals(true, vm.invalidInput());
  assertEquals("Error: No records to import", vm.dataError());
  assertEquals({Queued: 0, Processing: 0, Succeeded: 0, Failed: 0}, vm.importCounts());

  vm.setData("Na*me\r\ntest0");
  assertEquals(true, vm.invalidInput());
  assertEquals("", vm.dataError());
  assertEquals("Error: Invalid field name", vm.columns()[0].columnError());
  assertEquals({Queued: 1, Processing: 0, Succeeded: 0, Failed: 0}, vm.importCounts());

  vm.setData("a,b\r\nc,d");
  assertEquals(false, vm.invalidInput());
  assertEquals("", vm.dataError());
  assertEquals({Queued: 1, Processing: 0, Succeeded: 0, Failed: 0}, vm.importCounts());

  // Errors (whole batch)
  yield* anonApex("delete [select Id from Inspector_Test__c];");
  vm.dataFormat("csv");
  vm.importAction("create");
  vm.setData("Name,unknownfield\r\ntest2,222\r\ntest6,666\r\n");
  vm.doImport();
  assertEquals({text: "2 records will be imported.", action: undefined}, vm.confirmPopup());
  vm.confirmPopupYes();
  assertEquals({Queued: 0, Processing: 2, Succeeded: 0, Failed: 0}, vm.importCounts());
  assertEquals([["Name", "unknownfield", "__Status", "__Id", "__Action", "__Errors"], ["test2", "222", "Processing", "", "", ""], ["test6", "666", "Processing", "", "", ""]], vm.importTableResult().table);
  yield waitForSpinner();
  assertEquals({Queued: 0, Processing: 0, Succeeded: 0, Failed: 2}, vm.importCounts());
  assertEquals([["Name", "unknownfield", "__Status", "__Id", "__Action", "__Errors"], ["test2", "222", "Failed", "", "", "INVALID_FIELD: No such column \'unknownfield\' on entity \'Inspector_Test__c\'. If you are attempting to use a custom field, be sure to append the \'__c\' after the custom field name. Please reference your WSDL or the describe call for the appropriate names."], ["test6", "666", "Failed", "", "", "INVALID_FIELD: No such column \'unknownfield\' on entity \'Inspector_Test__c\'. If you are attempting to use a custom field, be sure to append the \'__c\' after the custom field name. Please reference your WSDL or the describe call for the appropriate names."]], vm.importTableResult().table);
  records = getRecords(yield sfConn.rest("/services/data/v35.0/query/?q=" + encodeURIComponent("select Name, Checkbox__c, Number__c, Lookup__r.Name from Inspector_Test__c order by Name")));
  assertEquals([], records);

  // Big result
  // TODO Write test for clipboard copy
  // TODO Write test for showStatus
}
