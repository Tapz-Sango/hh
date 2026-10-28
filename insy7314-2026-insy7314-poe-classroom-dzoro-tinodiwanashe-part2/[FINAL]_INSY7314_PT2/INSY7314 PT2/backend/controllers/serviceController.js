const Service = require('../models/Service');

//Get all the active service listings
exports.getAllServices = async (req, res, next) => {
  try {
    const services = await Service.find().populate('freelancerId', 'name email');
    res.status(200).json({ success: true, data: services });
  } catch (error) {
    next(error);
  }
};

//Get the single service listing by the ID
exports.getServiceById = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id).populate('freelancerId', 'name email');
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service listing not found' });
    }
    res.status(200).json({ success: true, data: service });
  } catch (error) {
    next(error);
  }
};

//Create a new service listing (Freelancers only)
exports.createService = async (req, res, next) => {
  try {
    const { title, description, price, category } = req.body;

    if (!title || !description || !price || !category) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    const newService = await Service.create({
      title,
      description,
      price,
      category,
      freelancerId: req.userId
    });

    res.status(201).json({ success: true, data: newService });
  } catch (error) {
    next(error);
  }
};

//Update a service, which only a creator can update
exports.updateService = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({ success: false, message: 'Service listing not found' });
    }

    if (service.freelancerId.toString() !== req.userId) {
      return res.status(403).json({ success: false, message: 'Unauthorized: You can only edit your own listings' });
    }

    const updatedService = await Service.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({ success: true, data: updatedService });
  } catch (error) {
    next(error);
  }
};

//Delete a service: which only a creator can delete
exports.deleteService = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({ success: false, message: 'Service listing not found' });
    }

    if (service.freelancerId.toString() !== req.userId) {
      return res.status(403).json({ success: false, message: 'Unauthorized: You can only delete your own listings' });
    }

    await service.deleteOne();
    res.status(200).json({ success: true, message: 'Service deleted successfully' });
  } catch (error) {
    next(error);
  }
};