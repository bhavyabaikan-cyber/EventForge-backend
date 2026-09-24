import { asyncHandler } from '../utils/asyncHandler.js';

const organizationFilter = (req) => {
  if (req.user?.role === 'platform_admin') return {};
  return req.user?.organization ? { organization: req.user.organization } : {};
};

export const createCrudController = (Model, options = {}) => ({
  list: asyncHandler(async (req, res) => {
    const query = { ...(options.scoped === false ? {} : organizationFilter(req)) };
    const items = await Model.find(query).sort({ createdAt: -1 }).limit(200).populate(options.populate || '');
    res.json(items);
  }),
  get: asyncHandler(async (req, res) => {
    const item = await Model.findById(req.params.id).populate(options.populate || '');
    if (!item) {
      res.status(404);
      throw new Error(`${Model.modelName} not found`);
    }
    res.json(item);
  }),
  create: asyncHandler(async (req, res) => {
    const body = { ...req.body };
    if (options.withOrganization !== false && req.user?.organization && !body.organization) {
      body.organization = req.user.organization;
    }
    if (options.createdBy && !body[options.createdBy]) body[options.createdBy] = req.user._id;
    const item = await Model.create(body);
    res.status(201).json(item);
  }),
  update: asyncHandler(async (req, res) => {
    const item = await Model.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!item) {
      res.status(404);
      throw new Error(`${Model.modelName} not found`);
    }
    res.json(item);
  }),
  remove: asyncHandler(async (req, res) => {
    const item = await Model.findByIdAndDelete(req.params.id);
    if (!item) {
      res.status(404);
      throw new Error(`${Model.modelName} not found`);
    }
    res.json({ message: `${Model.modelName} deleted` });
  })
});
