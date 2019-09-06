const express = require("express");

const router = express.Router();

const Projects = require("../data/helpers/projectModel.js");

router.use(express.json());

// GET /api/projects/:id
// get(id)
router.get("/:id", validateProjectId, (req, res) => {
  res.status(200).json(req.project);
});

// GET /api/projects/:id/actions
// getProjectsActions(id)
router.get("/:id/actions", validateProjectId, (req, res) => {
  const { id } = req.params;

  Projects.getProjectActions(id)
    .then(actions => {
      // console.log('actions', actions);
      if (actions && actions.length === 0) {
        res.status(200).json({
          message: `Project with id ${id} does not have any actions yet!`,
          actions: []
        });
      } else if (actions) {
        res.status(200).json(actions);
      } else {
        res
          .status(500)
          .json({ error: "Error occurred while getting actions." });
      }
    })
    .catch(err => {
      console.log(`Getting actions for project with id ${id}.`);
      res.status(500).json({ error: "Error occurred while getting actions." });
    });
});

// POST /api/projects
// insert(project)
router.post("/", validateProject, (req, res) => {
  const { body } = req;

  Projects.insert(body)
    .then(newProject => {
      res.status(201).json(newProject);
    })
    .catch(err => {
      console.log("Posting new project", err);
      res
        .status(500)
        .json({ error: "Error occurred while posting a new project." });
    });
});

// PUT /api/projects/:id
// update(id, changes)
router.put("/:id", validateProjectId, validateProject, (req, res) => {
  const { id } = req.params;
  const { body } = req;

  Projects.update(id, body)
    .then(updatedProject => {
      res.status(200).json(updatedProject);
    })
    .catch(err => {
      console.log("Updating project", err);
      res
        .status(500)
        .json({ error: "Error occurred while updating a project." });
    });
});

// DELETE /api/projects/:id
// remove(id)
router.delete("/:id", validateProjectId, (req, res) => {
  const { id } = req.params;

  Projects.remove(id)
    .then(removedProject => {
      res.status(200).json({
        message: `Deleted project with id ${id}`,
        deletedProject: req.project
      });
    })
    .catch(err => {
      console.log("Deleting project", err);
      res
        .status(500)
        .json({ error: "Error occurred while deleting a project." });
    });
});

function validateProjectId(req, res, next) {
  const { id } = req.params;

  Projects.get(id)
    .then(project => {
      // console.log('project', project);
      if (project) {
        req.project = project;
        next();
      } else {
        return res
          .status(400)
          .json({ error: `${id} is an invalid id or does not exist.` });
      }
    })
    .catch(err => {
      console.log("Getting project", err);
      return res
        .status(500)
        .json({ error: "Error occurred while getting project." });
    });
}

function validateProject(req, res, next) {
  const { body } = req;

  if (
    Object.keys(body).includes("name") &&
    Object.keys(body).includes("description")
  ) {
    if (
      Object.keys(body).length > 2 &&
      !Object.keys(body).includes("completed")
    ) {
      return res.status(400).json({ message: "Invalid data within body." });
    } else {
      next();
    }
  } else {
    return res
      .status(400)
      .json({ message: "Missing required name or description field." });
  }
}

module.exports = router;
