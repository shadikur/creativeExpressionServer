# Creative Expressions API

This repository contains the backend API server for the Creative Expressions Art & Craft School.

## Getting Started

To run the API server locally, follow the steps below:

1. Clone this repository to your local machine.
2. Install the required dependencies using the following command:

```javascript
npm install
```

3. Create a `.env` file in the root directory of the project and configure the necessary environment variables. Refer to the `.env.example` file for the required variables.
4. Start the server using the following command:

```javascript
npm start
```

This will start the server on `http://localhost:5000`. You can now make requests to the API endpoints.

## Live Demo
API is live at [https://creative-expressions-api.vercel.app/](https://creative-expressions-api.vercel.app/)

## API Endpoints

The API endpoints for the Creative Expressions API will be defined here. Please refer to the documentation for detailed information on available endpoints.

## Technologies Used

- Node.js
- Express.js
- MongoDB
- JSON Web Token (JWT)
- dotenv
- cors

## Image uploader
Multer has been use to handle image upload. Image will be stored in the server and the path will be saved in the database. Howevr, as Vercel does not allow to store image in the server, image upload with multer has been hosted on Digital Ocean. with a authorization token.

Here is the access to the blob storage using express and multer.
[https://blob.mylab.shadikur.com/multer](https://blob.mylab.shadikur.com/multer)

It will return a json object with the image url.

```javascript
{
  "success": true,
  "imageUrl": "https://blob.mylab.shadikur.com/public/uploads/file-1629780560799-1000000000.jpg"
}
```


## Configuration

```javascript	
// Middleware
app.use(cors());
app.use(express.json());
app.use('/public/uploads', express.static(path.join(__dirname, '/public/uploads')));

// Verify API Access Key
const verifyAPIKey = (req, res, next) => {
  const apiKey = req.headers['authorization'];
  const expectedAPIKey = process.env.MULTER_API_KEY; // Replace with your generated API access key

  if (!apiKey || apiKey !== expectedAPIKey) {
    res.status(401).json({ error: 'Unauthorized' });
  } else {
    next();
  }
};

// Multer configuration
const storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, 'public/uploads');
  },
  filename: function (req, file, callback) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileExtension = file.originalname.split('.').pop();
    callback(null, file.fieldname + '-' + uniqueSuffix + '.' + fileExtension);
  }
});

const upload = multer({ storage: storage });

// Multer endpoint with API key validation
app.post('/multer', verifyAPIKey, upload.single('file'), (req, res) => {
  if (!req.file) {
    console.log('No file received');
    return res.send({
      success: false
    });
  } else {
    console.log('File received:', req.file);

    // Move the file to the public/uploads folder
    const filePath = `public/uploads/${req.file.filename}`;
    fs.rename(req.file.path, filePath, (error) => {
      if (error) {
        console.log('Error moving file:', error);
        return res.send({
          success: false
        });
      }

      console.log('File moved successfully');

      // Generate the public URL for the file
      const imageUrl = `${req.protocol}://${req.get('host')}/${filePath}`;

      return res.send({
        success: true,
        imageUrl: imageUrl
      });
    });
  }
});
```

## License

This project is licensed under the [ISC License](LICENSE).

## Contact

For any inquiries or feedback, please contact me / Programming Hero, BD..


