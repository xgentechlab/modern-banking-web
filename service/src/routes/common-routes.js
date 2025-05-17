const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');
const { logger } = require('../utils/logger');

// Helper function to get mapping file path
const getMappingFile = async (moduleCode) => {
    try {
        const indexPath = path.join(__dirname, '../mapping/index.json');
        const indexContent = await fs.readFile(indexPath, 'utf8');
        const modulesList = JSON.parse(indexContent);
        
        const moduleInfo = modulesList.find(m => m.moduleCode === moduleCode);
        if (!moduleInfo) {
            throw new Error('Module not found');
        }
        
        return path.join(__dirname, '../mapping', moduleInfo.mappingFile);
    } catch (error) {
        logger.error(`Error finding mapping file for module ${moduleCode}: ${error.message}`);
        throw error;
    }
};

// Helper function to get request format file content
const getRequestFormatContent = async (mappingFile, submoduleCode) => {
    try {
        const mappingContent = await fs.readFile(mappingFile, 'utf8');
        const mapping = JSON.parse(mappingContent);
        
        const submodule = mapping.submodules.find(s => s.submoduleCode === submoduleCode);
        if (!submodule ) {
            throw new Error('Submodule not found');
        }
        if(submodule.requestFile){
            const requestFilePath = path.join(__dirname, '../dataFormats', mapping.moduleCode.toLowerCase(), submodule.requestFile);
            const fileContent = await fs.readFile(requestFilePath, 'utf8');
            return JSON.parse(fileContent);
        }
        return null;
    } catch (error) {
        logger.error(`Error reading request format file: ${error.message}`);
        throw error;
    }
};

// POST endpoint to fetch file contents
router.post('/request-format', async (req, res) => {
    try {
        const { moduleCode, submoduleCode } = req.body;

        if (!moduleCode || !submoduleCode) {
            return res.status(400).json({
                success: false,
                error: 'Module code and submodule code are required'
            });
        }

        const mappingFile = await getMappingFile(moduleCode);
        const fileContent = await getRequestFormatContent(mappingFile, submoduleCode);

        res.json({
            success: true,
            data: fileContent
        });

    } catch (error) {
        logger.error(`Error processing request: ${error.message}`);
        
        if (error.message.includes('not found')) {
            return res.status(404).json({
                success: false,
                error: 'No File Found'
            });
        }

        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

module.exports = router; 