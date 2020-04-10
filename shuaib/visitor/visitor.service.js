const db = require("helpers/db");
const Visitor = db.Visitor;

module.exports = {
  getAll,
  getById,
  create,
  update,
  delete: _delete,
  getVisitorsByName,
  getVisitorsByHost,
  previousVisitors,
  currentVisitors,
  checkoutVisit,
  checkInVisit,
  searchVisitByToken,
};

async function getAll() {
  return await Visitor.find().select("-hash");
}

async function getById(id) {
  return await Visitor.findById(id).select("-hash");
}

async function create(visitorParam) {
  const visitor = new Visitor(visitorParam);

  // save visitor
  await visitor.save();
}

async function update(id, visitorParam) {
  const visitor = await Visitor.findById(id);

  Object.assign(visitor, visitorParam);

  await visitor.save();
}

async function _delete(id) {
  await Visitor.findByIdAndRemove(id);
}

async function getVisitorsByName(visitorName) {
  return await Visitor.find({ name: visitorName.toString().trim() }).select(
    "-hash"
  );
}

async function getVisitorsByHost(hostName) {
  return await Visitor.find({ host: hostName.toString().trim() }).select(
    "-hash"
  );
}

async function previousVisitors() {
  return await Visitor.find({ checked_out: "YES" }).select("-hash");
}

async function currentVisitors() {
  return await Visitor.find({ checked_in: "YES", checked_out: "NO" }).select(
    "-hash"
  );
}

async function searchVisitByToken(token_no) {
  return await Visitor.find({ token_no: token_no }).select("-hash");
}

async function checkInVisit(id) {
  Visitor.findById(id, function (err, doc) {
    if (err) return;
    doc.checked_in = "YES";
    doc.save();
  });
}

async function checkoutVisit(id) {
  Visitor.findById(id, function (err, doc) {
    if (err) return;
    doc.checked_out = "YES";
    doc.save();
  });
}
