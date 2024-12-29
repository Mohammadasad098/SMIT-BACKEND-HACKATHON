import mongoose from "mongoose";
import Data from "../models/data.models.js";


const addData = (req, res) => {
  const { title, description } = req.body;

  if (!title || !description) {
    res.status(400).json({
      message: "title or description required",
    });
    return;
  }

  const data = Data.create({
    title,
    description,
  });
  res.status(201).json({
    message: "user added to database successfully",
  });
};



const getAllData = async (req, res) => {
  const datas = await Data.find({});
  res.status(200).json({
    datas: datas,
  });
};

const getDataWithId = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Not valid Id" });
  }

  const data = await Data.findById(id);
  if (!data) {
    res.status(404).json({
      message: "no todo found!",
    });
    return;
  }

  res.status(200).json(todo);
};



const deleteData = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Not valid id" });
  }

  const data = await Data.findOneAndDelete({ _id: id });

  if (!data) {
    return res.status(404).json({ error: "No Todo found" });
  }
  res.status(200).json({
    message: "todo deleted successfully",
    todo,
  });
};




const editData = async (req, res) => {
  const { id } = req.params;
  const { title, description, completed } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Invalid ID" });
  }
  try {
    const updatedData = await Data.findOneAndUpdate(
      { _id: id },
      { title, description, completed },
      { new: true, runValidators: true }
    );

    if (!updatedData) {
      return res.status(404).json({ error: "No Todo found" });
    }

    res.status(200).json({
      message: "Todo updated successfully",
      data: updatedData,
    });
  } catch (error) {
    res.status(500).json({ error: "Something went wrong", details: error.message });
  }
};

export { addData , getAllData , getDataWithId , deleteData, editData };