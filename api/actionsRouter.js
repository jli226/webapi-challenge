const express = require("express");

const router = express.Router();

const Projects = require("../data/helpers/projectModel.js");
const Actions = require("../data/helpers/actionModel.js");

router.use(express.json());

// GET /api/projects/:project_id/actions/:id
// get(id)
router.get(
  "/:project_id/actions/:id",
  validateProjectId,
  validateActionId,
  (req, res) => {
    res.status(200).json(req.action);
  }
);

// POST /api/projects/:project_id/actions
// insert(action)
router.post(
  "/:project_id/actions/",
  validateProjectId,
  validateAction,
  (req, res) => {
    Actions.insert(req.body)
      .then(newAction => {
        res.status(201).json(newAction);
      })
      .catch(err => {
        console.log("Posting new action", err);
        res
          .status(500)
          .json({ error: "Error occurred while posting a new action." });
      });
  }
);

// PUT /api/projects/:project_id/actions/:id
// update(id, changes)
router.put(
  "/:project_id/actions/:id",
  validateProjectId,
  validateActionId,
  validateAction,
  (req, res) => {
    const { id } = req.params;
    const { body } = req;

    Actions.update(id, body)
      .then(updatedAction => {
        res.status(200).json(updatedAction);
      })
      .catch(err => {
        console.log("Updating action", err);
        res
          .status(500)
          .json({ error: "Error occurred while updating a action." });
      });
  }
);

// DELETE /api/projects/:project_id/actions/:id
// remove(id)
router.delete(
  "/:project_id/actions/:id",
  validateProjectId,
  validateActionId,
  (req, res) => {
    const { id } = req.params;

    Actions.remove(id)
      .then(removedAction => {
        res.status(200).json({
          message: `Deleted action with id ${id}`,
          deletedAction: req.action
        });
      })
      .catch(err => {
        console.log("Deleting action", err);
        res
          .status(500)
          .json({ error: "Error occurred while deleting a action." });
      });
  }
);

function validateActionId(req, res, next) {
  const { id } = req.params;

  Actions.get(id)
    .then(action => {
      // console.log('action', action);
      if (action) {
        req.action = action;
        next();
      } else {
        return res
          .status(400)
          .json({ error: `${id} is an invalid id or does not exist.` });
      }
    })
    .catch(err => {
      console.log("Getting action", err);
      return res
        .status(500)
        .json({ error: "Error occurred while getting action." });
    });
}

function validateProjectId(req, res, next) {
  const { project_id } = req.params;

  Projects.get(project_id)
    .then(project => {
      // console.log('project', project);
      if (project) {
        req.project = project;
        next();
      } else {
        return res
          .status(400)
          .json({ error: `${project_id} is an invalid id or does not exist.` });
      }
    })
    .catch(err => {
      console.log("Getting project", err);
      return res
        .status(500)
        .json({ error: "Error occurred while getting project." });
    });
}

function validateAction(req, res, next) {
  const { body } = req;
  const { project_id } = req.params;

  if (project_id != body.project_id) {
    return res.status(400).json({
      error: `Project id (${project_id}) does not match project_id (${body.project_id}) in action data.`
    });
  }

  if (
    Object.keys(body).includes("project_id") &&
    Object.keys(body).includes("description") &&
    Object.keys(body).includes("notes")
  ) {
    if (
      Object.keys(body).length > 3 &&
      !Object.keys(body).includes("completed")
    ) {
      return res.status(400).json({ message: "Invalid data within body." });
    } else {
      next();
    }
  } else {
    return res.status(400).json({
      message: "Missing required project_id, description, or notes field."
    });
  }
}

module.exports = router;
