const Pet = require("../models/Pet");

//helpers
const getToken = require("../helpers/get-token");
const getUserByToken = require("../helpers/get-user-by-token");
const ObjectId = require("mongoose").Types.ObjectId;

module.exports = class PetController {
  //create a pet
  static async create(req, res) {
    const { name, age, weight, sex, color } = req.body;

    const images = req.files;

    const available = true;

    //images uploads

    //validations
    if (!name) {
      res.status(422).json({ message: "Nome é obrigatório" });
      return;
    }
    if (!age) {
      res.status(422).json({ message: "Idade é obrigatório" });
      return;
    }
    if (!weight) {
      res.status(422).json({ message: "Peso é obrigatório" });
      return;
    }
    if (!sex) {
      res.status(422).json({ message: "Sexo é obrigatório" });
      return;
    }
    if (!color) {
      res.status(422).json({ message: "Cor é obrigatório" });
      return;
    }
    if (images.length === 0) {
      res.status(422).json({ message: "A imagem é obrigatório" });
      return;
    }

    //get pet owner
    const token = getToken(req);
    const user = await getUserByToken(token);

    //create a pet
    const pet = new Pet({
      name,
      age,
      sex,
      weight,
      color,
      available,
      images: [],
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        image: user.image,
        phone: user.phone,
      },
    });

    images.map((img) => {
      pet.images.push(img.filename);
    });

    try {
      const newPet = await pet.save();
      res.status(201).json({ message: "Pet Cadastrado com Sucesso", newPet });
    } catch (err) {
      res.status(500).json({ message: err });
    }
  }
  static async getAllPets(req, res) {
    const pets = await Pet.find().sort("-createdAt");

    res.status(200).json({ pets: pets });
  }
  static async getAllUserPets(req, res) {
    //get user from token
    const token = getToken(req);
    const user = await getUserByToken(token);
    const pets = await Pet.find({ "user._id": user._id }).sort("-createdAt");

    res.status(200).json({ pets });
  }
  static async getAllUserAdoptions(req, res) {
    //get user from token
    const token = getToken(req);
    const user = await getUserByToken(token);
    const pets = await Pet.find({ "adopter._id": user._id }).sort("-createdAt");

    res.status(200).json({ pets });
  }
  static async getPetById(req, res) {
    const id = req.params.id;
    if (!ObjectId.isValid(id)) {
      res.status(422).json({ message: "ID inválido" });
      return;
    }

    const pet = await Pet.findById(id);

    if (!pet) {
      res.status(404).json({ message: "Pet não encontrado" });
      return;
    }
    res.status(200).json({ pet });
  }
  static async deletePetById(req, res) {
    const id = req.params.id;
    //check if id is valid
    if (!ObjectId.isValid(id)) {
      res.status(422).json({ message: "ID inválido" });
      return;
    }

    const pet = await Pet.findById(id);
    //check if pet is exist
    if (!pet) {
      res.status(404).json({ message: "Pet não encontrado" });
      return;
    }

    //check if logged in user registered the pet
    const token = getToken(req);
    const user = await getUserByToken(token);

    if (pet.user._id.toString() !== user._id.toString()) {
      res.status(422).json({ message: "O usuário não é o dono do pet" });
      return;
    }

    await Pet.findByIdAndRemove(id);

    res.status(200).json({ message: "Pet removido com sucesso!" });
  }
  static async updatePet(req, res) {
    const id = req.params.id;
    //check if id is valid
    if (!ObjectId.isValid(id)) {
      res.status(422).json({ message: "ID inválido" });
      return;
    }

    const pet = await Pet.findById(id);
    //check if pet is exist
    if (!pet) {
      res.status(404).json({ message: "Pet não encontrado" });
      return;
    }

    const { name, age, weight, sex, color, available } = req.body;
    const images = req.files;

    const updateData = {};

    //check if logged in user registered the pet
    const token = getToken(req);
    const user = await getUserByToken(token);

    if (pet.user._id.toString() !== user._id.toString()) {
      res.status(422).json({ message: "O usuário não é o dono do pet" });
      return;
    }

    //validation
    if (!name) {
      res.status(422).json({ message: "Nome é obrigatório" });
      return;
    }
    updateData.name = name;
    if (!age) {
      res.status(422).json({ message: "Idade é obrigatório" });
      return;
    }
    updateData.age = age;
    if (!weight) {
      res.status(422).json({ message: "Peso é obrigatório" });
      return;
    }
    updateData.weight = weight;
    if (!sex) {
      res.status(422).json({ message: "Sexo é obrigatório" });
      return;
    }
    updateData.sex = sex;
    if (!color) {
      res.status(422).json({ message: "Cor é obrigatório" });
      return;
    }
    updateData.color = color;
    if (images.length > 0) {
      updateData.images = [];
      images.map((image) => {
        updateData.images.push(image.filename);
      });
    } 

    await Pet.findByIdAndUpdate(id, updateData);

    res.status(200).json({ message: "Pet atualizado com sucesso!" });
  }
  static async schedule(req, res) {
    const id = req.params.id;
    //check if id is valid
    if (!ObjectId.isValid(id)) {
      res.status(422).json({ message: "ID inválido" });
      return;
    }
    const pet = await Pet.findById(id);
    //check if pet is exist
    if (!pet) {
      res.status(404).json({ message: "Pet não encontrado" });
      return;
    }
    //check if logged in user registered the pet
    const token = getToken(req);
    const user = await getUserByToken(token);

    if (pet.user._id.equals(user._id)) {
      res.status(422).json({ message: "O usuário já é o dono do pet" });
      return;
    }

    //check if user has already schedule a visit with this pet
    if (pet.adopter) {
      if (pet.adopter._id.equals(user._id)) {
        res
          .status(422)
          .json({ message: "Você já agendou uma visita com este pet" });
        return;
      }
    }

    //add user to pet
    pet.adopter = {
      _id: user._id,
      name: user.name,
      image: user.image,
    };

    await Pet.findByIdAndUpdate(id, pet);

    res
      .status(200)
      .json({
        message: `Visita Agendada com sucesso, entre em contato com ${pet.user.name}, pelo o telefone ${pet.user.phone}`,
      });
  }
  static async concludeAdoption(req, res){
    const id = req.params.id;
    //check if id is valid
    if (!ObjectId.isValid(id)) {
      res.status(422).json({ message: "ID inválido" });
      return;
    }
    const pet = await Pet.findById(id);
    //check if pet is exist
    if (!pet) {
      res.status(404).json({ message: "Pet não encontrado" });
      return;
    }
    //check if logged in user registered the pet
    const token = getToken(req);
    const user = await getUserByToken(token);

    if (pet.user._id.toString() !== user._id.toString()) {
      res.status(422).json({ message: "O usuário não é o dono do pet" });
      return;
    }

    pet.available = false

    await Pet.findByIdAndUpdate(id, pet)

    res.status(200).json({ message: "Parabéns! O ciclo de adoção foi finalizado com sucesso!"})
  }
};
