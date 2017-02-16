var fs = require('fs');
var faker = require('faker');

var LANGUAGES = [
  'Afrikaans', 'Chinese', 'English', 'French', 'German', 'Indonesian', 'Italian', 'Japanese', 'Korean', 'Russian', 'Spanish',
];

var UNITS = [
  'ACCT1101', 'ACCT1112', 'ACCT1113', 'AHEA1101', 'AHEA1102', 'AHEA1103', 'AHEA1104', 'ANHB1101', 'ANHB1102', 'ANIM1001',
  'ANTH1001', 'ANTH1002', 'ARCT1001', 'ARCT1010', 'ARCT1030', 'ARCY1001', 'ARCY1002', 'ASIA1001', 'ASIA1002', 'BIOL1130',
  'BIOL1131', 'BUSN1102', 'CHEM1001', 'CHEM1002', 'CHEM1003', 'CHEM1004', 'CHIN1001', 'CHIN1401', 'CHIN1402', 'CHIN1403',
  'CHIN1404', 'CHIN1405', 'CHIN1406', 'CITS1001', 'CITS1401', 'CITS1402', 'CLAN1001', 'CLAN1002', 'CLAN1101', 'COMM1001',
  'COMM1002', 'COMM1901', 'EART1104', 'EART1105', 'ECON1101', 'ECON1102', 'ECON1111', 'ECON1120', 'ECON1141', 'EDUC1102',
  'EDUC1103', 'EDUC1104', 'EMPL1101', 'EMPL1102', 'EMPL1206', 'ENGL1000', 'ENGL1002', 'ENGL1401', 'ENGL1501', 'ENGL1902',
  'ENSC1001', 'ENSC1002', 'ENSC1601', 'ENVT1103', 'ENVT1104', 'FINA1109', 'FINA1221', 'FREN1401', 'FREN1402', 'FREN1403',
  'FREN1404', 'FREN1405', 'FREN1406', 'GCRL1000', 'GEND1901', 'GEOG1103', 'GEOG1104', 'GRMN1002', 'GRMN1401', 'GRMN1402',
  'GRMN1403', 'GRMN1404', 'GRMN1405', 'GRMN1406', 'HART1000', 'HART1001', 'HART1003', 'HIST1001', 'HIST1002', 'HIST1003',
  'HIST1102', 'HIST1901', 'HUMA1901', 'HUMA1902', 'IDES1000', 'IDES1040', 'IMED1001', 'IMED1002', 'IMED1003', 'IMED1004',
  'IMED1108', 'INDG1000', 'INDG1120', 'INDG1150', 'INDG1160', 'INDO1001', 'INDO1401', 'INDO1402', 'INDO1403', 'INDO1404',
  'INDO1405', 'INDO1406', 'ITAL1401', 'ITAL1402', 'ITAL1403', 'ITAL1404', 'ITAL1405', 'ITAL1406', 'JAPN1001', 'JAPN1401',
  'JAPN1402', 'JAPN1403', 'JAPN1404', 'JAPN1405', 'JAPN1406', 'KORE1401', 'KORE1402', 'KORE1405', 'KORE1406', 'LACH1000',
  'LACH1010', 'LACH1020', 'LAWS1104', 'LAWS1110', 'LAWS1111', 'LAWS1120', 'LING1001', 'LING1002', 'LING1901', 'MATH1001',
  'MATH1002', 'MATH1011', 'MATH1012', 'MATH1601', 'MATH1720', 'MATH1721', 'MATH1722', 'MGMT1135', 'MGMT1136', 'MKTG1107',
  'MKTG1203', 'MKTG1204', 'MUSC1055', 'MUSC1310', 'MUSC1321', 'MUSC1322', 'MUSC1341', 'MUSC1342', 'MUSC1350', 'MUSC1981',
  'MUSC1982', 'NEUR1001', 'PHAR1101', 'PHIL1001', 'PHIL1002', 'PHIL1003', 'PHYS1001', 'PHYS1002', 'PHYS1021', 'PHYS1022',
  'PHYS1030', 'POLS1101', 'POLS1102', 'PSYC1101', 'PSYC1102', 'PUBH1101', 'PUBH1102', 'SCIE1104', 'SCIE1106', 'SCIE1121',
  'SCIE1122', 'SCOM1101', 'SPAN1401', 'SPAN1402', 'SSEH1101', 'SSEH1102', 'SSEH1103', 'SSEH1104', 'STAT1400', 'STAT1520',
  'SVLG1001', 'SVLG1002', 'URBD1000', 'VISA1050', 'VISA1051', 'VISA1052', 'VISA1053', 'VISA1054',
];

var user = [];
var tutor = [];
var languageTutored = [];
var unitTutored = [];


for (var i=0; i<100; i++) {
  // user
  var userID = i + 90000000;
  var name = faker.name.firstName() + ' ' + faker.name.lastName();
  var DOB = '2009-04-04';
  var sex = Math.floor(Math.random() * 2) ? 'M' : 'F';
  var phone = '04' + (32000000 + Math.floor(Math.random() * 1000000));
  var paswordHash = 'edc9d523df0a3b8f9387980a3ba858f0c708e87fab0503ded7cc756e670a0d8560dfacd58e9fd3234f26dfd4f890bc197649a869e68d3312cb7f7906446b13e0';
  var passwordSalt = '348d64648ff3c136';

  // tutor
  //userID
  var postcode = (1000 + Math.floor(Math.random() * 9000)) + '';
  var bio = faker.lorem.sentence();
  var visable = 1;
  var verified = '1';

  //languageTutored
  var bilingual = Math.floor(Math.random() * 2);
  var j = Math.floor(Math.random() * LANGUAGES.length);
  var language = [LANGUAGES[j]];
  if (bilingual) language.push(LANGUAGES[(j+1+Math.floor(Math.random() * (LANGUAGES.length-2))) % LANGUAGES.length]);

  //units tutored
  var numUnits = Math.floor(Math.random() * 4) + 1;
  var unit = [];
  var k = Math.floor(Math.random() * UNITS.length);
  while (numUnits !== 0) {
    unit.push(UNITS[k]);
    k = (k+1) % UNITS.length;
    numUnits--;
  }


  user.push('(' + userID + ', "' + name + '", "' + DOB + '", "' + sex + '", "' + phone + '", "' + paswordHash + '", "' + passwordSalt + '")');
  tutor.push('(' + userID + ', ' + postcode + ', "' + bio + '", ' + visable + ', ' + verified + ')');
  for (var l=0; l < language.length; l++) {
    languageTutored.push('(' + userID + ', "' + language[l] + '")');
  }
  for (var u=0; u < unit.length; u++) {
    unitTutored.push('(' + userID + ', "' + unit[u] + '")');
  }
}

var text = '';

text =  text +
        'INSERT INTO `user` (`userID`, `name`, `DOB`, `sex`, `phone`, `passwordHash`, `passwordSalt`) VALUES \n' +
        user.join(',\n') +
        ';\n';

text =  text +
        'INSERT INTO `tutor` (`userID`, `postcode`, `bio`, `visible`, `verified`) VALUES \n' +
        tutor.join(',\n') +
        ';\n';

text =  text +
        'INSERT INTO `languageTutored` (`tutor`, `language`) VALUES \n' +
        languageTutored.join(',\n') +
        ';\n';

text =  text +
        'INSERT INTO `unitTutored` (`tutor`, `unit`) VALUES \n' +
        unitTutored.join(',\n') +
        ';\n';


fs.writeFile('fake_tutors.sql', text, function(err) {
  if (err) {
    return console.log(err);
  }

  console.log('DONE!');
});


