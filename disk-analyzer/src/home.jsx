import React from "react";

function HomePage({ onStartScan }) {
  return (
    <div className="Home">
    <div className="min-h-screen bg-gray-100 flex flex-col justify-between p-4 ">
      <div className="flex-grow flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-lg w-full space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-blue-600">
              Welcome to Diskaroo
            </h1>
            <p className="text-gray-700 text-lg">Your handy disk analyzer</p>
          </div>
          <div className="flex flex-col items-center space-y-6">
            <button
              onClick={onStartScan}
              className=" w-full bg-blue-600 text-white py-3 px-6 rounded-lg shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-transform transform hover:scale-105"
            >
              Start Scan
            </button>
            <div className="PaddingBottom w-full border-t pt-4">
              <label className="block text-gray-600 mb-2 text-center">
                Select a directory:
              </label>
              <input
                type="file"
                directory=""
                webkitdirectory=""
                className="w-full p-2 border-2 rounded-lg focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      </div>
      <div className="text-center py-4 text-gray-600">&copy; Diskaroo 2023</div>
    </div>
    </div>
  );
}

export default HomePage;
